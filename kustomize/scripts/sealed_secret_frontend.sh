#!/usr/bin/env bash

set -u

# Create a SealedSecret for the VCell-AI frontend's sensitive environment values
# (the Auth0 server-side session/client secrets used by @auth0/nextjs-auth0).
#
# Usage:
#   ./sealed_secret_frontend.sh [--cert <filename.pem>] \
#       [--controller-name <name>] [--controller-namespace <ns>] \
#       <namespace> <auth0_secret> <auth0_client_secret> \
#       > secret-frontend.yaml
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
if [ "$#" -ne 3 ]; then
    echo "Illegal number of parameters"
    echo "Usage: ./sealed_secret_frontend.sh [--cert <filename.pem>] <namespace> <auth0_secret> <auth0_client_secret>"
    exit 1
fi

SECRET_NAME="frontend-secrets"
NAMESPACE=$1
AUTH0_SECRET=$2
AUTH0_CLIENT_SECRET=$3

# Create the generic secret and seal it
kubectl create secret generic ${SECRET_NAME} --dry-run=client \
      --from-literal=auth0-secret="${AUTH0_SECRET}" \
      --from-literal=auth0-client-secret="${AUTH0_CLIENT_SECRET}" \
      --namespace="${NAMESPACE}" -o yaml | kubeseal --controller-name=${CONTROLLER_NAME} --controller-namespace=${CONTROLLER_NAMESPACE} --format yaml ${CERT_ARG:+--cert=$CERT_ARG}
