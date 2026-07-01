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

### Why the frontend has secrets: Node vs browser trust boundary

`frontend-secrets` (`AUTH0_SECRET`, `AUTH0_CLIENT_SECRET`) may look surprising for
a "frontend" — secrets must never reach an untrusted browser. They don't. The
`frontend` image is a **Next.js app, which is two programs**:

- **Node server** (the pod / `frontend` container) — *trusted*. It runs SSR and the
  `/auth/*` route handlers. This is the only thing that reads `AUTH0_SECRET` and
  `AUTH0_CLIENT_SECRET`.
- **Browser** (React bundle on the user's machine) — *untrusted*. It gets only the
  compiled JS/HTML and an httpOnly, encrypted session cookie.

The app uses `@auth0/nextjs-auth0` v4 in the **Backend-for-Frontend (BFF)** pattern:
Authorization Code + PKCE, with the `code`→token exchange executed **server-side** by
the Node process (a confidential client / Auth0 "Regular Web Application"). The client
secret authenticates that exchange and the session key encrypts the resulting tokens
into the httpOnly cookie — all inside the Node server.

What this means for these Kubernetes secrets:

- `AUTH0_SECRET` / `AUTH0_CLIENT_SECRET` are consumed **only by the Node server pod**.
  They are never inlined into the browser bundle (only `NEXT_PUBLIC_*` values are, and
  the only one here is the non-secret `NEXT_PUBLIC_API_URL`). Sealing them and injecting
  them as pod env is correct and safe.
- The refresh token stays inside the encrypted cookie (server-decryptable only). The
  browser does receive a short-lived **access token** (via a server endpoint) to call
  the backend directly — a scoped bearer token, not a secret.

> If the frontend is ever re-architected to a **public SPA client** (e.g.
> `@auth0/auth0-react`, code+PKCE in the browser, Auth0 "Single-Page Application"),
> there is **no client secret at all** — delete `frontend-secrets`, drop
> `AUTH0_SECRET`/`AUTH0_CLIENT_SECRET` from `secrets.dat`/`secrets.sh`, and remove the
> `frontend-secrets` `secretKeyRef`s from `base/frontend.yaml`.

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
(`images[].newTag`). Images are published to ghcr by
`.github/workflows/build_containers.yml` on **git-tag push** — CI pushes the
**git tag** as the image tag (e.g. `0.1.6.2`); there is **no `:latest`** tag, so
overlays must pin a real published tag. `scripts/build_and_push.sh <tag>
virtualcell` does the same build/push locally.

## Known follow-up: frontend `NEXT_PUBLIC_API_URL` is baked at build time

`NEXT_PUBLIC_*` values are inlined into the browser bundle at **Next.js build
time**, not read at runtime. The current CI (`build_containers.yml`) hardcodes

```
NEXT_PUBLIC_API_URL=http://k8s-wn-01.cam.uchc.edu:30001
```

when building `vcell-ai-frontend`, so the published image always points the
browser at that NodePort — it will **ignore** the `NEXT_PUBLIC_API_URL` set in
`config/<env>/frontend.env` at runtime, and will not use the ingress host
(`vcell-ai[-dev].cam.uchc.edu/api`) this overlay configures.

To make the frontend image environment-portable, one of:

1. Turn `NEXT_PUBLIC_API_URL` into a **Docker build arg** and build a separate
   frontend image per environment (CI passes the right value per tag/target), or
2. Refactor the frontend so the API base URL is resolved at **runtime** (e.g. a
   server-rendered `/config` endpoint or a non-`NEXT_PUBLIC_` server var proxied
   by the Node server), so one image works everywhere.

Until then, align the CI build arg / NodePort with how each environment is
actually served. This touches `build_containers.yml` and the frontend
`Dockerfile`, so it is intentionally left out of this PR.

## Notes

- The ingress serves the frontend at `/` and proxies `/api/*` to the backend
  (the `/api` prefix is stripped via `rewrite-target`, since FastAPI routes are
  at the root, e.g. `/biomodel`, `/kb`, `/query`).
- `NEXT_PUBLIC_*` vars are inlined at Next.js **build** time — set
  `NEXT_PUBLIC_API_URL` when building the frontend image, not only at runtime.
- Placeholder values in `config/<env>/*.env` (Azure endpoint, Auth0 domain,
  Supabase URL, hostnames) must be filled in for your deployment.
