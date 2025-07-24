#!/bin/bash

# Get the latest published image tag for each microservice
FRONTEND_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/frontend \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)" | head -n1 | cut -d',' -f1)

AUTH_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/auth-service \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)" | head -n1 | cut -d',' -f1)

CART_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/cart-api \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)" | head -n1 | cut -d',' -f1)

PRODUCTS_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/products-api \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)" | head -n1 | cut -d',' -f1)

API_GATEWAY_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/api-gateway \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAGS)" | head -n1 | cut -d',' -f1)

# Debug output for tag values
echo "FRONTEND_TAG: $FRONTEND_TAG"
echo "AUTH_TAG: $AUTH_TAG"
echo "CART_TAG: $CART_TAG"
echo "PRODUCTS_TAG: $PRODUCTS_TAG"
echo "API_GATEWAY_TAG: $API_GATEWAY_TAG"

# Replace placeholder in the deployment templates
sed "s/REPLACE_WITH_TAG/$FRONTEND_TAG/" deployment.template.yaml > deployment.yaml
sed "s/REPLACE_WITH_TAG/$AUTH_TAG/" auth-deployment.yaml > auth-deployment.generated.yaml
sed "s/REPLACE_WITH_TAG/$CART_TAG/" cart-deployment.yaml > cart-deployment.generated.yaml
sed "s/REPLACE_WITH_TAG/$PRODUCTS_TAG/" products-deployment.yaml > products-deployment.generated.yaml
sed "s/REPLACE_WITH_TAG/$API_GATEWAY_TAG/" api-gateway-deployment.yaml > api-gateway-deployment.generated.yaml

echo "✅ Updated deployment files with latest tags."
echo "🚀 Deploying to GKE..."

kubectl apply -f deployment.yaml
kubectl apply -f auth-deployment.generated.yaml
kubectl apply -f cart-deployment.generated.yaml
kubectl apply -f products-deployment.generated.yaml
kubectl apply -f api-gateway-deployment.generated.yaml
kubectl apply -f frontend-service.yaml

echo "✅ Deployment applied. Use 'kubectl get services' to check external IP."
