# VCell-AI — Kubernetes deployment (kustomize + sealed secrets)

Deploys the three VCell-AI services from `docker-compose.yml` to Kubernetes:

| Component | Image | Port | Notes |
|-----------|-------|------|-------|
| `qdrant`   | `qdrant/qdrant`                          | 6333 / 6334 | StatefulSet + 10Gi PVC |
| `backend`  | `ghcr.io/virtualcell/vcell-ai-backend`   | 8000 | FastAPI |
| `frontend` | `ghcr.io/virtualcell/vcell-ai-frontend`  | 3000 | Next.js |

Structured after `../sms-api/kustomize`.

## Layout

```
kustomize/
├── base/                     # Deployments/StatefulSet + Services (env-agnostic)
│   ├── qdrant.yaml
│   ├── backend.yaml
│   ├── frontend.yaml
│   └── kustomization.yaml
├── config/<env>/             # non-secret config -> ConfigMaps (backend/frontend .env)
│   ├── backend.env
│   ├── frontend.env
│   └── kustomization.yaml
├── overlays/<env>/           # per-environment: namespace, images, ingress, secrets
│   ├── kustomization.yaml
│   ├── ingress.yaml
│   ├── secrets.sh            # master script -> generates the 3 sealed secrets
│   ├── secrets.dat.template  # copy to secrets.dat (gitignored) and fill in
│   ├── secrets.dat           # (gitignored) plaintext inputs
│   ├── secret-backend.yaml   # (gitignored) generated SealedSecret
│   ├── secret-frontend.yaml  # (gitignored) generated SealedSecret
│   └── secret-ghcr.yaml      # (gitignored) generated SealedSecret
└── scripts/                  # sealing + build helpers
    ├── sealed_secret_backend.sh
    ├── sealed_secret_frontend.sh
    ├── sealed_secret_ghcr.sh
    └── build_and_push.sh
```

Environments (`<env>`): `vcell-ai-rke` (prod, on-prem UCHC RKE), `vcell-ai-rke-dev`
(dev), `vcell-ai-local` (minikube). Each overlay's namespace equals its `<env>` name.

## Secrets model

Non-secret configuration lives in `config/<env>/*.env` (committed). Only truly
sensitive values are sealed:

- **backend-secrets** → `AZURE_API_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_PUBLIC_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **frontend-secrets** → `AUTH0_SECRET`, `AUTH0_CLIENT_SECRET`
- **ghcr-secret** → ghcr.io image-pull credentials (`.dockerconfigjson`)

`secrets.dat` (plaintext) and the generated `secret-*.yaml` are **gitignored**.
Run `secrets.sh` to (re)generate the sealed manifests before applying an overlay.

## One-time cluster setup (Sealed Secrets controller)

```bash
brew install kubeseal
helm repo add sealed-secrets https://bitnami-labs.github.io/sealed-secrets
helm install sealed-secrets -n kube-system \
     --set-string fullnameOverride=sealed-secrets-controller sealed-secrets/sealed-secrets
```

The scripts default to controller `sealed-secrets-controller` in namespace
`kube-system` (override with `--controller-name` / `--controller-namespace`, and
pass `--cert <file.pem>` for offline sealing on GKE/GovCloud).

## Deploy an environment

```bash
cd kustomize/overlays/vcell-ai-rke        # or -rke-dev / -local

# 1. create the namespace
kubectl create namespace vcell-ai-rke

# 2. provide secret values
cp secrets.dat.template secrets.dat
$EDITOR secrets.dat                        # fill in real values (gitignored)

# 3. generate the sealed secrets (needs kubeseal + controller reachable)
./secrets.sh

# 4. review the rendered manifests
kubectl kustomize .

# 5. apply
kubectl apply -k .
```

Update image tags per environment in `overlays/<env>/kustomization.yaml`
(`images[].newTag`). Build & push images with
`scripts/build_and_push.sh <tag> virtualcell`.

## Notes

- The ingress serves the frontend at `/` and proxies `/api/*` to the backend
  (the `/api` prefix is stripped via `rewrite-target`, since FastAPI routes are
  at the root, e.g. `/biomodel`, `/kb`, `/query`).
- `NEXT_PUBLIC_*` vars are inlined at Next.js **build** time — set
  `NEXT_PUBLIC_API_URL` when building the frontend image, not only at runtime.
- Placeholder values in `config/<env>/*.env` (Azure endpoint, Auth0 domain,
  Supabase URL, hostnames) must be filled in for your deployment.
