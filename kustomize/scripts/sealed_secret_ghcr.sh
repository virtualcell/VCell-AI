#!/usr/bin/env bash

set -u

# Create a SealedSecret holding ghcr.io registry credentials so the cluster can
# pull the private vcell-ai-backend / vcell-ai-frontend images.
#
# Usage:
#   ./sealed_secret_ghcr.sh [--cert <filename.pem>] \
#       [--controller-name <name>] [--controller-namespace <ns>] \
#       <namespace> <github_user> <github_user_email> <github_token> \
#       > secret-ghcr.yaml
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
if [ "$#" -ne 4 ]; then
    echo "Illegal number of parameters"
    echo "Usage: ./sealed_secret_ghcr.sh [--cert <filename.pem>] <namespace> <github_user> <github_user_email> <github_token>"
    exit 1
fi

SECRET_NAME="ghcr-secret"
SERVER="ghcr.io"
NAMESPACE=$1
USERNAME=$2
EMAIL=$3
PASSWORD=$4

# Create the docker-registry secret and seal it
kubectl create secret docker-registry ${SECRET_NAME} --dry-run=client \
      --docker-server="${SERVER}" \
      --docker-username="${USERNAME}" \
      --docker-email="${EMAIL}" \
      --docker-password="${PASSWORD}" \
      --namespace="${NAMESPACE}" -o yaml | kubeseal --controller-name=${CONTROLLER_NAME} --controller-namespace=${CONTROLLER_NAMESPACE} --format yaml ${CERT_ARG:+--cert=$CERT_ARG}
