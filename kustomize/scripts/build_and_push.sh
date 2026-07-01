#!/usr/bin/env bash

set -e

# Build and push the VCell-AI backend and frontend images to ghcr.io.
#
# Usage:
#   ./build_and_push.sh [<tag>] [<container_org>]
#
#   tag           image tag to build/push (default: "latest")
#   container_org ghcr.io org (default: "virtualcell")
#
# Example:
#   ./build_and_push.sh 0.1.0 virtualcell

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

tag=${1:-latest}
container_org=${2:-virtualcell}

echo "building and pushing images to ghcr.io/${container_org} with tag ${tag}"

# service -> build context (Dockerfile lives at <context>/Dockerfile)
build_service() {
  local service="$1"
  local context="$2"
  local image_name="ghcr.io/${container_org}/vcell-ai-${service}:${tag}"

  echo "==> building ${image_name} from ${context}"
  docker buildx build --platform=linux/amd64 -f "${context}/Dockerfile" --tag "${image_name}" "${context}" \
    || { echo "Failed to build ${service}"; exit 1; }

  docker push "${image_name}" \
    || { echo "Failed to push ${service}"; exit 1; }

  echo "built and pushed vcell-ai-${service}:${tag}"
}

build_service backend  "${ROOT_DIR}/backend"
build_service frontend "${ROOT_DIR}/frontend"

echo "done."
