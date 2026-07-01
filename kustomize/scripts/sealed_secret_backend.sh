#!/usr/bin/env bash

set -u

# Create a SealedSecret for the VCell-AI backend's sensitive environment values.
#
# Usage:
#   ./sealed_secret_backend.sh [--cert <filename.pem>] \
#       [--controller-name <name>] [--controller-namespace <ns>] \
#       <namespace> <azure_api_key> <langfuse_secret_key> <langfuse_public_key> <supabase_service_role_key> \
#       > secret-backend.yaml
#
# For GKE / AWS GovCloud the controller cert is needed and can be fetched with:
#   kubeseal --fetch-cert > filename.pem
#   # or
#   kubectl get secret -n kube-system -l sealedsecrets.bitnami.com/sealed-secrets-key -o yaml \
#       | grep tls.crt | awk '{print $2}' | base64 --decode > filename.pem

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
if [ "$#" -ne 5 ]; then
    echo "Illegal number of parameters"
    echo "Usage: ./sealed_secret_backend.sh [--cert <filename.pem>] <namespace> <azure_api_key> <langfuse_secret_key> <langfuse_public_key> <supabase_service_role_key>"
    exit 1
fi

SECRET_NAME="backend-secrets"
NAMESPACE=$1
AZURE_API_KEY=$2
LANGFUSE_SECRET_KEY=$3
LANGFUSE_PUBLIC_KEY=$4
SUPABASE_SERVICE_ROLE_KEY=$5

# Create the generic secret and seal it
kubectl create secret generic ${SECRET_NAME} --dry-run=client \
      --from-literal=azure-api-key="${AZURE_API_KEY}" \
      --from-literal=langfuse-secret-key="${LANGFUSE_SECRET_KEY}" \
      --from-literal=langfuse-public-key="${LANGFUSE_PUBLIC_KEY}" \
      --from-literal=supabase-service-role-key="${SUPABASE_SERVICE_ROLE_KEY}" \
      --namespace="${NAMESPACE}" -o yaml | kubeseal --controller-name=${CONTROLLER_NAME} --controller-namespace=${CONTROLLER_NAMESPACE} --format yaml ${CERT_ARG:+--cert=$CERT_ARG}
