#!/usr/bin/env bash

set -eu  # Exit on error

# Master script: reads plaintext values from secrets.dat (gitignored) and writes
# the three sealed secret manifests this overlay references:
#   secret-backend.yaml   (backend-secrets)
#   secret-frontend.yaml  (frontend-secrets)
#   secret-ghcr.yaml      (ghcr-secret, image pull)

# Get the directory where this script is located and calculate repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

# Set paths relative to the repository root
NAMESPACE=vcell-ai-local
SCRIPTS_DIR="${REPO_ROOT}/kustomize/scripts"
SECRETS_DIR="${REPO_ROOT}/kustomize/overlays/${NAMESPACE}"

# Sealed secrets controller configuration (minikube install into kube-system,
# see README — `helm install sealed-secrets -n kube-system ...`)
SEALED_SECRETS_CONTROLLER_NAME=sealed-secrets-controller
SEALED_SECRETS_CONTROLLER_NAMESPACE=kube-system

# Load secrets from data file (not committed to git)
SECRETS_DATA_FILE="${SECRETS_DIR}/secrets.dat"
if [ ! -f "$SECRETS_DATA_FILE" ]; then
    echo "ERROR: Secrets data file not found: $SECRETS_DATA_FILE"
    echo "Please create it from secrets.dat.template"
    echo "  cp ${SECRETS_DIR}/secrets.dat.template ${SECRETS_DIR}/secrets.dat"
    echo "  # Then edit secrets.dat with your actual values"
    exit 1
fi

echo "Loading secrets from: $SECRETS_DATA_FILE"
source "$SECRETS_DATA_FILE"

echo ""
echo "=== Generating Sealed Secrets for namespace ${NAMESPACE} ==="

# backend-secrets: <namespace> <azure_api_key> <langfuse_secret_key> <langfuse_public_key> <supabase_service_role_key>
echo "Generating backend secrets..."
${SCRIPTS_DIR}/sealed_secret_backend.sh \
    --controller-name ${SEALED_SECRETS_CONTROLLER_NAME} \
    --controller-namespace ${SEALED_SECRETS_CONTROLLER_NAMESPACE} \
    ${NAMESPACE} "${AZURE_API_KEY}" "${LANGFUSE_SECRET_KEY}" "${LANGFUSE_PUBLIC_KEY}" "${SUPABASE_SERVICE_ROLE_KEY}" "${LITELLM_MASTER_KEY}" \
    > ${SECRETS_DIR}/secret-backend.yaml
echo "✓ secret-backend.yaml generated"

# frontend-secrets: <namespace> <auth0_secret> <auth0_client_secret>
echo "Generating frontend secrets..."
${SCRIPTS_DIR}/sealed_secret_frontend.sh \
    --controller-name ${SEALED_SECRETS_CONTROLLER_NAME} \
    --controller-namespace ${SEALED_SECRETS_CONTROLLER_NAMESPACE} \
    ${NAMESPACE} "${AUTH0_SECRET}" "${AUTH0_CLIENT_SECRET}" \
    > ${SECRETS_DIR}/secret-frontend.yaml
echo "✓ secret-frontend.yaml generated"

# ghcr-secret: <namespace> <github_user> <github_user_email> <github_token>
echo "Generating GHCR image-pull secret..."
${SCRIPTS_DIR}/sealed_secret_ghcr.sh \
    --controller-name ${SEALED_SECRETS_CONTROLLER_NAME} \
    --controller-namespace ${SEALED_SECRETS_CONTROLLER_NAMESPACE} \
    ${NAMESPACE} ${GH_USER_NAME} ${GH_USER_EMAIL} ${GH_PAT} \
    > ${SECRETS_DIR}/secret-ghcr.yaml
echo "✓ secret-ghcr.yaml generated"

# litellm-secrets: <namespace> <master_key> <azure_api_key> <openai_api_key> <langfuse_secret_key> <langfuse_public_key> <database_url>
echo "Generating LiteLLM secrets..."
${SCRIPTS_DIR}/sealed_secret_litellm.sh \
    --controller-name ${SEALED_SECRETS_CONTROLLER_NAME} \
    --controller-namespace ${SEALED_SECRETS_CONTROLLER_NAMESPACE} \
    ${NAMESPACE} "${LITELLM_MASTER_KEY}" "${AZURE_API_KEY}" "${OPENAI_API_KEY}" "${LANGFUSE_SECRET_KEY}" "${LANGFUSE_PUBLIC_KEY}" "${DATABASE_URL}" \
    > ${SECRETS_DIR}/secret-litellm.yaml
echo "✓ secret-litellm.yaml generated"

echo ""
echo "=== All sealed secrets generated successfully! ==="
