# Deploying to dev (via FluxCD)

The **dev** site (`https://vcell-ai-dev.cam.uchc.edu`) is deployed by **FluxCD** —
Flux watches `main` and auto-applies the `vcell-ai-rke-dev` overlay to the cluster
within ~1–2 min of a change. **You never run `kubectl`** and don't need cluster
credentials — you only push a tag and edit one file.

## What you need
- Write access to `virtualcell/VCell-AI` (push tags, open PRs). That's it.

## Steps to ship a new version to dev

**1. Merge your changes to `main`** (normal PR flow).

**2. Cut a version tag → builds the images.**
Tags use `0.1.x`. Check the latest with `git tag --sort=-v:refname | head` (currently `0.1.9`) and pick the next (e.g. `0.1.10`).

```bash
git checkout main && git pull
git tag 0.1.10
git push origin 0.1.10
```
This triggers the **“Create AI Website Images”** GitHub Action, which builds and pushes:
- `ghcr.io/virtualcell/vcell-ai-backend:0.1.10`
- `ghcr.io/virtualcell/vcell-ai-frontend:0.1.10`

> Prefer the UI? GitHub → **Actions → Create AI Website Images → Run workflow**, enter the tag. Same result.

**3. Wait for the build to finish** (green in the Actions tab, ~5 min). The images must exist before the next step, or the pods can't pull them.

**4. Bump the dev overlay to the new tag.**
Edit **`kustomize/overlays/vcell-ai-rke-dev/kustomization.yaml`** — change **both** `newTag`s:
```yaml
images:
  - name: ghcr.io/virtualcell/vcell-ai-backend
    newTag: 0.1.10      # was 0.1.9
  - name: ghcr.io/virtualcell/vcell-ai-frontend
    newTag: 0.1.10      # was 0.1.9
```
Open a PR and merge it to `main`.

**5. Done — Flux deploys automatically.** Within ~1–2 min of the merge, Flux rolls
the dev pods to the new tag. Verify by loading `https://vcell-ai-dev.cam.uchc.edu`
(a hard refresh helps).

## Notes
- **Only tag + edit `newTag`.** Everything else (namespaces, services, ingress,
  secrets) is already managed by Flux.
- **Config/secret changes** (not image bumps) deploy the same way: change the file
  under `kustomize/overlays/vcell-ai-rke-dev/` (or the `config/`/`base/` it uses),
  merge to `main`, Flux applies it. (Secrets need re-sealing — ask whoever has
  cluster access.)
- **No cluster access needed for the above.** If a deploy looks stuck, ping someone
  with `kubectl` access to check `flux get kustomization vcell-ai-dev`.
