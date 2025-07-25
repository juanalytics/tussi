#!/bin/bash

# Get the latest published image tag for each microservice
FRONTEND_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/frontend \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAG)" | head -n1 | cut -d',' -f1)

AUTH_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/auth-service \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAG)" | head -n1 | cut -d',' -f1)

CART_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/cart-api \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAG)" | head -n1 | cut -d',' -f1)

PRODUCTS_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/products-api \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAG)" | head -n1 | cut -d',' -f1)

API_GATEWAY_TAG=$(gcloud artifacts docker tags list \
  us-central1-docker.pkg.dev/tussi-466501/microservices-repo/api-gateway \
  --sort-by=~UPDATE_TIME \
  --limit=1 \
  --format="value(TAG)" | head -n1 | cut -d',' -f1)

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

# Apply namespace and storageclass first (if not already applied)
kubectl apply -f namespaces.yml
kubectl apply -f storageclass.yml

# Apply PVCs for databases
kubectl apply -f auth-db-pvc.yaml
kubectl apply -f products-db-pvc.yaml
kubectl apply -f carts-db-pvc.yaml

# Apply database deployments and services
kubectl apply -f auth-db-deployment.yaml
kubectl apply -f auth-db-service.yaml
kubectl apply -f products-db-deployment.yaml
kubectl apply -f products-db-service.yaml
kubectl apply -f carts-db-deployment.yaml
kubectl apply -f carts-db-service.yaml

# Apply microservice deployments and services
kubectl apply -f kubernetes/auth-deployment.generated.yaml
kubectl apply -f kubernetes/auth-service.yaml
kubectl apply -f kubernetes/products-deployment.generated.yaml
kubectl apply -f kubernetes/products-service.yaml
kubectl apply -f kubernetes/cart-deployment.generated.yaml
kubectl apply -f kubernetes/cart-service.yaml

# Apply API gateway deployment and service
kubectl apply -f api-gateway-deployment.generated.yaml
kubectl apply -f api-gateway-service.yaml

# Apply frontend deployment and service
kubectl apply -f deployment.yaml
kubectl apply -f frontend-service.yaml

# Optionally apply ingress if needed
# kubectl apply -f ingress.yml

echo "✅ Deployment applied. Use 'kubectl get services' to check external IP."
