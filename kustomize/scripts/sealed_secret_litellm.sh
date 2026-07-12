#!/usr/bin/env bash

set -u

# Create a SealedSecret for the LiteLLM proxy's sensitive environment values:
# master key, the Azure OpenAI key and/or hosted-OpenAI key (the openai-model
# alias accepts either — pass real value(s) for whichever you have, leave the
# other as a placeholder), Langfuse tracing keys, and the Postgres DATABASE_URL
# used to persist virtual keys / budgets.
#
# Usage:
#   ./sealed_secret_litellm.sh [--cert <filename.pem>] \
#       [--controller-name <name>] [--controller-namespace <ns>] \
#       <namespace> <master_key> <azure_api_key> <openai_api_key> <langfuse_secret_key> <langfuse_public_key> <database_url> \
#       > secret-litellm.yaml
#
# For GKE / AWS GovCloud the controller cert is needed and can be fetched with:
#   kubeseal --fetch-cert > filename.pem

CERT_ARG=""
CONTROLLER_NAME="sealed-secrets-controller"
CONTROLLER_NAMESPACE="sealed-secrets"

# Parse optional arguments
while [[ "$1" == --* ]]; do
  case "$1" in
    --cert)
      CERT_ARG="$2"
      shift 2
      ;;
    --controller-name)
      CONTROLLER_NAME="$2"
      shift 2
      ;;
    --controller-namespace)
      CONTROLLER_NAMESPACE="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Validate the number of positional arguments
if [ "$#" -ne 7 ]; then
    echo "Illegal number of parameters"
    echo "Usage: ./sealed_secret_litellm.sh [--cert <filename.pem>] <namespace> <master_key> <azure_api_key> <openai_api_key> <langfuse_secret_key> <langfuse_public_key> <database_url>"
    exit 1
fi

SECRET_NAME="litellm-secrets"
NAMESPACE=$1
MASTER_KEY=$2
AZURE_API_KEY=$3
OPENAI_API_KEY=$4
LANGFUSE_SECRET_KEY=$5
LANGFUSE_PUBLIC_KEY=$6
DATABASE_URL=$7

# Create the generic secret and seal it
kubectl create secret generic ${SECRET_NAME} --dry-run=client \
      --from-literal=master-key="${MASTER_KEY}" \
      --from-literal=azure-api-key="${AZURE_API_KEY}" \
      --from-literal=openai-api-key="${OPENAI_API_KEY}" \
      --from-literal=langfuse-secret-key="${LANGFUSE_SECRET_KEY}" \
      --from-literal=langfuse-public-key="${LANGFUSE_PUBLIC_KEY}" \
      --from-literal=database-url="${DATABASE_URL}" \
      --namespace="${NAMESPACE}" -o yaml | kubeseal --controller-name=${CONTROLLER_NAME} --controller-namespace=${CONTROLLER_NAMESPACE} --format yaml ${CERT_ARG:+--cert=$CERT_ARG}
