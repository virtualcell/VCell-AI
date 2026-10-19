# Gemini on Vertex AI: how the LiteLLM proxy authenticates to GCP

VCell-AI offers Gemini through the same LiteLLM proxy that serves OpenAI and the local
Ollama model. Unlike those two, Gemini has **no API key anywhere** — not in a sealed secret,
not in an env file, not in the pod. It authenticates with GCP **Workload Identity
Federation** (WIF), trading a short-lived Kubernetes ServiceAccount token for a Vertex AI
access token on every refresh.

This document records why, what was measured before committing to the design, and what was
actually built. It is written to be readable by someone who has not seen the ticket (Burwood
REQ0040169).

**Status (2026-10-19):** the GCP side is built and proven end to end. Burwood never created the
pool; Jim did, after being granted the admin roles listed under *GCP-side configuration*. The
action log at the end of this document is the record of exactly what was run.

## Why not a service account key

The obvious approach — download a GCP service account JSON key, seal it, mount it — is
blocked by org policy `iam.managed.disableServiceAccountKeyCreation` on the CAIA project
`caia-fac-uconn-2-225-2026`. Burwood offered to exclude our project from that policy. We
declined, because the policy is right: a downloaded key is a non-expiring, portable
credential that would live in git (sealed, but still), that we would own the rotation of,
and that would make this project the org's standing exception. WIF costs one extra `gcloud`
invocation on their side and about fifteen lines of YAML on ours.

Google's own guidance agrees — service account keys are "persistent, portable credentials"
whose alternatives "provide the same access without the risks."

## How it works

```
  litellm pod
    │  ServiceAccount: litellm
    │
    ├─ projected volume  /var/run/secrets/gcp/token
    │     a JWT signed by the cluster, aud = the WIF provider, sub =
    │     system:serviceaccount:vcell-ai-rke-dev:litellm, 1-hour lifetime,
    │     rotated in place by kubelet at ~80% of that
    │
    ├─ ConfigMap file    /etc/gcp/wif.json      (GOOGLE_APPLICATION_CREDENTIALS)
    │     external-account config: which pool/provider to present the token to,
    │     which Google service account to impersonate, where the token file is.
    │     Holds no key material.
    │
    └─ google.auth.default()
          → POST sts.googleapis.com    (k8s token  →  federated token)
          → POST iamcredentials.googleapis.com  (impersonate the Google SA)
          → Bearer token for aiplatform.googleapis.com
```

Nothing long-lived is stored. The only durable trust is on the Google side: the identity
pool holds a copy of our cluster's **public** signing key and a condition naming exactly one
Kubernetes ServiceAccount.

## What was measured

All of the following was verified against the live `vcell-ai-rke-dev` namespace and the
running `litellm` pod before the design was settled, rather than assumed from documentation.

| Fact | Result |
|---|---|
| Cluster | RKE2 `v1.31.13+rke2r1`, on-prem VxRail, 7 nodes |
| SA token issuer | `https://kubernetes.default.svc.cluster.local` (`--service-account-issuer` on `kube-apiserver-k8s-cp-01`, and `/.well-known/openid-configuration`) |
| JWKS | a single RSA/RS256 key, kid `_sEcsu_IaVE_5SVJKSmCtYi3oj6lhCvQMorJjUmimXI` |
| Custom-audience token minting | **works.** A token minted with a GCP audience carries `iss` as above and `sub = system:serviceaccount:vcell-ai-rke-dev:<sa>` — exactly the claims the attribute mapping needs |
| `--api-audiences` | set to `https://kubernetes.default.svc.cluster.local,rke2`, and it does **not** restrict projected-token audiences (it governs tokens presented *to* the API server) |
| Pod egress to Google | `sts.googleapis.com`, `iamcredentials.googleapis.com`, `us-central1-aiplatform.googleapis.com` all reachable from the litellm pod — TLS completes and Google answers. No egress firewall or proxy in the way |
| LiteLLM | 1.92.0, with `google-auth` 2.52.0 and `google-cloud-aiplatform` 1.133.0, as of 2026-09-02. The image tag is `main-stable`, so these drift |
| LiteLLM WIF support | first-class. `vertex_llm_base.py` branches on `type == "external_account"` and calls `google.auth.identity_pool.Credentials.from_info()`; a `credential_source.file` config (our case) hits that branch |
| GCP project number | `637433805721` |
| **End-to-end rehearsal** (2026-09-02) | the real rendered `gcp-wif.json` plus a real cluster token was fed to `google.auth` inside the litellm pod: it parsed as an identity-pool credential, wired up impersonation, read the projected token, and **reached Google's STS**, which rejected only the `POOL_ID` placeholder. Every link except the pool itself was therefore proven |
| **Full chain** (2026-10-19) | with the pool, provider and service account created: a token minted by `kubectl create token litellm` in `vcell-ai-rke-dev` was exchanged at STS, impersonated `vcell-ai-litellm@…`, and called `gemini-2.5-flash` in `us-central1`, which answered. Run from a laptop with curl, not from the pod, since the branch is not yet deployed |
| Vertex with a user credential | `gemini-2.5-flash` also answers for `schaff.jim@gmail.com` directly, which is the docker-compose ADC path |

## The one non-obvious part: the issuer is not on the internet

Our API server is `https://155.37.250.221:6443` and is VPN-only. The issuer string
`https://kubernetes.default.svc.cluster.local` does not resolve publicly, and anonymous JWKS
discovery is not enabled on this cluster (the `system:service-account-issuer-discovery`
ClusterRoleBinding is bound to `system:serviceaccounts`, not `system:unauthenticated`).

So **Google cannot fetch our discovery document or JWKS**, and a provider created the normal
way — pointing at an issuer URL and letting Google go and read the keys — would fail.

The supported answer is to upload the JWKS inline with `--jwk-json-path` when creating the
provider. Google documents this precisely for self-hosted clusters and states plainly:
*"The cluster doesn't need to be accessible over the internet."* See
[Configure Workload Identity Federation with Kubernetes](https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-kubernetes).

This is the single correction we sent back to Burwood — their first reply asked for the
issuer URL and JWKS, which was right, but the provider has to be told to *trust* the uploaded
keys rather than to go and get them.

## Operational consequence: JWKS rotation

The uploaded JWKS is a **static snapshot**. If the cluster's service-account signing key ever
changes — RKE2 key rotation, a control-plane rebuild, a cluster re-creation — federation breaks
silently and every Gemini call starts returning 403 until someone re-uploads:

```bash
kubectl get --raw /openid/v1/jwks > cluster-jwks.json
gcloud iam workload-identity-pools providers update-oidc rke2-vcell-ai \
    --location=global --workload-identity-pool=vcell-ai-pool \
    --jwk-json-path=cluster-jwks.json
```

Treat `update-oidc` as replace-all and keep the old `cluster-jwks.json` until the new one is
confirmed working. (Google's Kubernetes WIF page does not state a key limit or the exact
replace semantics; an earlier version of this note claimed both, unverified.) If Gemini starts
failing with auth errors and nothing in this repo changed, check this first. Re-uploading needs
`roles/iam.workloadIdentityPoolAdmin` on the project.

## Design choices worth knowing

**Impersonation, not direct resource access.** The credential config includes
`service_account_impersonation_url`, so the federated identity impersonates a Google service
account that holds `roles/aiplatform.user`. Direct resource access (binding the role straight
to the federated principal) also appears supported for Vertex AI, but it is the less
battle-tested path, it leaves no SA-based quota/billing project, and it is the configuration
where LiteLLM's since-fixed missing-scopes bug ([#17377](https://github.com/BerriAI/litellm/issues/17377),
fixed in v1.80.8) used to bite. The IAM difference is one binding.

**A dedicated ServiceAccount, not `default`.** Every other pod in this namespace runs as the
namespace `default` ServiceAccount. Federating that would mean *any* pod here could obtain
Vertex credentials. The `litellm` ServiceAccount exists solely so the pool's attribute
condition can name one workload.

**`GOOGLE_APPLICATION_CREDENTIALS`, not `vertex_credentials`.** Both work — LiteLLM's
`vertex_credentials` accepts a path — but the env var route means `google.auth.default()`
handles it, which gives a useful property: with the variable unset, it falls back to a
developer's own `gcloud auth application-default login`. The same `gemini-model` alias
therefore works in docker compose once the ADC file is mounted (an optional, commented-out
volume in `docker-compose.yml`, paired with `GOOGLE_APPLICATION_CREDENTIALS` in `litellm.env`).
It does **not** work in the `vcell-ai-local` kustomize overlay: nothing mounts ADC into that
pod, and a local cluster's tokens are not trusted by the pool. Pointing `vertex_credentials`
at a path that does not exist locally would fail outright, because LiteLLM treats a
non-existent path as inline JSON and tries to parse it.

**The credential config is not a secret.** `gcp-wif.json` lives in the plain
`litellm-config-file` ConfigMap next to `config.yaml`, not in the sealed `litellm-secrets`.
Google is explicit that it "doesn't contain a private key and doesn't need to be kept
confidential." This is the practical payoff of WIF: adding Gemini required no `kubeseal`
round-trip and no change to `secrets.dat` or `sealed_secret_litellm.sh`.

**The two audience strings differ by scheme, on purpose.** The projected volume's `audience:`
uses `https://iam.googleapis.com/...` (Google's manifest form); `gcp-wif.json`'s `audience`
field uses the schemeless `//iam.googleapis.com/...` (what `create-cred-config` generates).
Both are default allowed audiences for the same provider. Do not "fix" one to match the other.

## GCP-side configuration

Run by Jim on 2026-10-19 in project `caia-fac-uconn-2-225-2026` (number `637433805721`), as
`schaff.jim@gmail.com`, after being granted `roles/iam.workloadIdentityPoolAdmin`,
`roles/iam.serviceAccountAdmin`, `roles/iam.serviceAccountKeyAdmin`,
`roles/serviceusage.serviceUsageAdmin` and `roles/resourcemanager.projectIamAdmin` on the project.
The four APIs in the last command were already enabled, so that step was a no-op. A pre-existing
`vcellai-service-account@…` (origin unknown, holds `roles/aiplatform.user`, has only a
Google-managed key) was left alone and is not part of this setup.

```bash
POOL=vcell-ai-pool
PROVIDER=rke2-vcell-ai
PROJECT=caia-fac-uconn-2-225-2026
PROJECT_NUMBER=637433805721
KSA=system:serviceaccount:vcell-ai-rke-dev:litellm

gcloud iam workload-identity-pools create $POOL \
    --project=$PROJECT --location=global \
    --display-name="VCell-AI on-prem RKE2"

# --jwk-json-path is what makes this work without a publicly reachable issuer.
gcloud iam workload-identity-pools providers create-oidc $PROVIDER \
    --project=$PROJECT --location=global --workload-identity-pool=$POOL \
    --issuer-uri="https://kubernetes.default.svc.cluster.local" \
    --jwk-json-path=cluster-jwks.json \
    --attribute-mapping="google.subject=assertion.sub" \
    --attribute-condition="assertion.sub == '${KSA}'"

gcloud iam service-accounts create vcell-ai-litellm --project=$PROJECT

gcloud projects add-iam-policy-binding $PROJECT \
    --member="serviceAccount:vcell-ai-litellm@${PROJECT}.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# The project NUMBER is required in this member string; the project ID is not supported.
gcloud iam service-accounts add-iam-policy-binding \
    vcell-ai-litellm@${PROJECT}.iam.gserviceaccount.com --project=$PROJECT \
    --member="principal://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL}/subject/${KSA}" \
    --role="roles/iam.workloadIdentityUser"

gcloud services enable aiplatform.googleapis.com sts.googleapis.com \
    iamcredentials.googleapis.com --project=$PROJECT
```

The `attribute-condition` is the load-bearing security control: without it the pool trusts
every ServiceAccount in the cluster.

## Verifying a change

In order — each step isolates one failure domain, so the first one that fails tells you where
the problem is.

**1. Token shape.** Confirms the cluster mints what the pool expects.

```bash
AUD="https://iam.googleapis.com/projects/637433805721/locations/global/workloadIdentityPools/vcell-ai-pool/providers/rke2-vcell-ai"
kubectl -n vcell-ai-rke-dev create token litellm --audience="$AUD" \
  | cut -d. -f2 | base64 -d 2>/dev/null | jq '{iss, aud, sub}'
```

Expect `sub` to be `system:serviceaccount:vcell-ai-rke-dev:litellm`.

**2. The STS exchange, before involving LiteLLM.** An error here means the GCP-side attribute
condition or an IAM binding is wrong; success means federation is done and anything that
fails later is our config.

```bash
kubectl -n vcell-ai-rke-dev exec deploy/litellm -- python -c "
import google.auth, google.auth.transport.requests
c,_ = google.auth.default(scopes=['https://www.googleapis.com/auth/cloud-platform'])
c.refresh(google.auth.transport.requests.Request())
print('token acquired, expires', c.expiry)"
```

Note that `google.auth.default()` and `load_credentials_from_file()` resolve the project ID
eagerly, which performs a token exchange *at load time*. A misconfigured pool therefore
raises inside the `default()` call, before you ever reach `refresh()` — so wrap the whole
snippet, not just the refresh, when you adapt it.

Reading the error matters:

| STS says | Means |
|---|---|
| `Invalid value for "audience"` | the audience string is malformed or names a pool/provider that does not exist |
| `Unable to parse the provided JWT` / issuer errors | the uploaded JWKS no longer matches the cluster's signing key — re-upload it (see above) |
| `The given credential is rejected by the attribute condition` | the condition does not match `system:serviceaccount:vcell-ai-rke-dev:litellm` |
| a 403 on `generateAccessToken` (`iam.serviceAccounts.getAccessToken` denied) | the `roles/iam.workloadIdentityUser` binding on the Google service account is missing, names the project ID instead of the project number, **or was created in the last few minutes** — on 2026-10-19 the binding took about four minutes to take effect, and the exact same request then succeeded |

**3. The LiteLLM alias**, from inside the cluster:

```bash
kubectl -n vcell-ai-rke-dev exec deploy/litellm -- \
  curl -sS localhost:4000/v1/chat/completions \
    -H "Authorization: Bearer $LITELLM_MASTER_KEY" -H 'Content-Type: application/json' \
    -d '{"model":"gemini-model","messages":[{"role":"user","content":"say ok"}]}'
```

**4. End to end** — pick Gemini in the dropdown at https://vcell-ai-dev.cam.uchc.edu and
confirm the call shows up in Langfuse.

**5. Token refresh.** The one failure mode a smoke test will not catch: confirm a Gemini call
still succeeds more than an hour after the pod started, which exercises kubelet's in-place
rotation of the projected token and google-auth re-reading the file.

## Action log, 2026-10-19

Every state-changing action taken to build the GCP side, in order. Identity for all Google
calls: `schaff.jim@gmail.com`. Cluster: the RKE2 dev cluster at `155.37.250.221`.

Read-only beforehand: confirmed no identity pools existed in the project, listed service
accounts and enabled APIs, read the cluster's OpenID discovery document and JWKS (one RS256 key,
kid `_sEcsu_IaVE_5SVJKSmCtYi3oj6lhCvQMorJjUmimXI`, matching the 2026-09-02 measurement).

GCP, project `caia-fac-uconn-2-225-2026`:

1. Saved the cluster JWKS (`kubectl get --raw /openid/v1/jwks`) to `cluster-jwks.json`.
2. Created identity pool `vcell-ai-pool` (display name "VCell-AI on-prem RKE2").
3. Created OIDC provider `rke2-vcell-ai` in that pool: issuer
   `https://kubernetes.default.svc.cluster.local`, JWKS uploaded inline, mapping
   `google.subject=assertion.sub`, condition
   `assertion.sub == 'system:serviceaccount:vcell-ai-rke-dev:litellm'`. State ACTIVE.
4. Created service account `vcell-ai-litellm` (display name "VCell-AI LiteLLM proxy (WIF from RKE2)").
5. Granted it `roles/aiplatform.user` on the project.
6. Granted `principal://iam.googleapis.com/projects/637433805721/locations/global/workloadIdentityPools/vcell-ai-pool/subject/system:serviceaccount:vcell-ai-rke-dev:litellm`
   the role `roles/iam.workloadIdentityUser` on that service account.

No APIs enabled, no service account keys created, no changes to any other principal or resource.

Kubernetes, namespace `vcell-ai-rke-dev`:

7. Created ServiceAccount `litellm` by hand, so a token could be minted for the test below.
   `kustomize/base/litellm.yaml` defines the same object; Flux adopts it on merge.
8. Minted several 10-minute tokens for that ServiceAccount with the provider audience. Nothing persisted.

Verification, run with curl from a laptop:

9. Token claims: `iss`, `aud` and `sub` exactly as the pool expects.
10. STS exchange: federated token issued.
11. Impersonation: 403 at first (binding ~2 min old), success after ~4 min.
12. `gemini-2.5-flash:generateContent` with the impersonated token: answered.

Repo: filled the pool, provider and service-account names into `kustomize/base/gcp-wif.json`
and `kustomize/base/litellm.yaml`; rebased the branch onto `main`.

Still to do: merge, then run step 5 of *Verifying a change* (a call more than an hour after the
pod starts) against the deployed pod.

## Related

- Ticket: Burwood REQ0040169 — superseded; the GCP side was built in-house (see action log)
- Grant project `caia-fac-uconn-2-225-2026` has `award_end=2026-12-31`; this setup should be
  cheap to tear down or move.
