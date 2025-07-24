#!/bin/bash

# Get the latest published image tag
LATEST_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/frontend \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)")

# Replace placeholder in the deployment template
sed "s/REPLACE_WITH_TAG/$LATEST_TAG/" deployment.template.yaml > deployment.yaml

echo "✅ Updated deployment.yaml with latest tag: $LATEST_TAG"
echo "🚀 Deploying to GKE..."

kubectl apply -f deployment.yaml
kubectl apply -f frontend-service.yaml

echo "✅ Deployment applied. Use 'kubectl get services' to check external IP."
