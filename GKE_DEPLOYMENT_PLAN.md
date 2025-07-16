# GKE Deployment Plan for Tussi Prototype

This document outlines the step-by-step plan to deploy the Tussi e-commerce prototype to Google Kubernetes Engine (GKE). This guide covers containerization, GKE cluster setup, Kubernetes manifests for each service, and deployment instructions.

## 1. Prerequisites

### 1.1. Google Cloud Platform (GCP) Account

- **GCP Account**: You need a GCP account with billing enabled.
- **GCP Project**: Create a new GCP project or use an existing one. Note your **Project ID**.
- **APIs**: Enable the following APIs in your GCP project:
  - Kubernetes Engine API
  - Artifact Registry API
  - Compute Engine API

### 1.2. Local Environment Setup

- **Google Cloud SDK (`gcloud`)**: [Install and initialize the gcloud CLI](https://cloud.google.com/sdk/docs/install).
- **`kubectl`**: Install the Kubernetes command-line tool. You can install it via `gcloud`:
  ```bash
  gcloud components install kubectl
  ```
- **Docker**: Ensure Docker is installed and running locally to build container images.

## 2. Containerization & Artifact Registry

### 2.1. Configure Docker Authentication

Configure Docker to authenticate with Google Artifact Registry (GAR), which will store your container images.

```bash
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 2.2. Create an Artifact Registry Repository

Create a repository in GAR to store your Docker images.

```bash
gcloud artifacts repositories create tussi-services \
  --repository-format=docker \
  --location=us-central1 \
  --description="Docker repository for Tussi microservices"
```

### 2.3. Build and Push Docker Images

For each service (`api-gateway`, `frontend`, `auth-service`, `products-api`, `cart-api`), you need to build the Docker image and push it to your GAR repository.

**Template for building and pushing an image:**

```bash
export PROJECT_ID=[YOUR_PROJECT_ID]
export IMAGE_NAME=[SERVICE_NAME]
export IMAGE_TAG="us-central1-docker.pkg.dev/${PROJECT_ID}/tussi-services/${IMAGE_NAME}:v1.0.0"

docker build -t "${IMAGE_TAG}" ./path/to/service
docker push "${IMAGE_TAG}"
```

**Example for `api-gateway`:**

```bash
export PROJECT_ID=[YOUR_PROJECT_ID]
export IMAGE_TAG="us-central1-docker.pkg.dev/${PROJECT_ID}/tussi-services/api-gateway:v1.0.0"

docker build -t "${IMAGE_TAG}" ./api-gateway
docker push "${IMAGE_TAG}"
```

Repeat this process for all services.

## 3. GKE Cluster Setup

### 3.1. Create a GKE Cluster

Create a regional GKE cluster. A regional cluster provides high availability by replicating the control plane and nodes across multiple zones.

```bash
gcloud container clusters create tussi-cluster \
  --project=${PROJECT_ID} \
  --region=us-central1 \
  --machine-type=e2-medium \
  --num-nodes=1 \
  --enable-autoscaling --min-nodes=1 --max-nodes=3 \
  --release-channel=regular \
  --enable-ip-alias
```

### 3.2. Connect `kubectl` to the Cluster

After the cluster is created, configure `kubectl` to connect to it.

```bash
gcloud container clusters get-credentials tussi-cluster --region=us-central1
```

## 4. Kubernetes Manifests

All Kubernetes YAML manifests will be stored in a new `kubernetes/` directory.

### 4.1. Namespaces

Create namespaces to logically isolate the components.

- `kubernetes/namespaces.yml`:
  ```yaml
  apiVersion: v1
  kind: Namespace
  metadata:
    name: tussi-services
  ---
  apiVersion: v1
  kind: Namespace
  metadata:
    name: tussi-databases
  ```

### 4.2. Secrets

Create Kubernetes Secrets to store sensitive information like database passwords and JWT keys.

**Create the secrets using `kubectl`:**

```bash
# JWT Secret
kubectl create secret generic jwt-secret -n tussi-services --from-literal=JWT_SECRET=$(openssl rand -hex 32)

# Database Passwords
kubectl create secret generic postgres-auth-secret -n tussi-databases --from-literal=password=$(openssl rand -hex 16)
kubectl create secret generic postgres-products-secret -n tussi-databases --from-literal=password=$(openssl rand -hex 16)
kubectl create secret generic mongo-secret -n tussi-databases --from-literal=password=$(openssl rand -hex 16)
```

### 4.3. Persistent Storage (Databases)

We will use `StatefulSets` for the databases to ensure stable network identifiers and persistent storage.

- `kubernetes/storageclass.yml`: Defines a standard SSD persistent disk.
- `kubernetes/databases.yml`: Contains the `StatefulSet`, `PersistentVolumeClaim`, and `Service` for each database (PostgreSQL and MongoDB).

### 4.4. Application Manifests

For each microservice, we will create a `Deployment`, a `Service`, and a `HorizontalPodAutoscaler`.

- `kubernetes/api-gateway.yml`
- `kubernetes/frontend.yml`
- `kubernetes/auth-service.yml`
- `kubernetes/products-api.yml`
- `kubernetes/cart-api.yml`

### 4.5. Ingress and SSL

To expose the services to the internet, we will use GKE Ingress with a Google-managed SSL certificate.

- `kubernetes/ingress.yml`: This manifest will define path-based routing (`/api/auth`, `/api/products`, etc.) to the appropriate backend services and will handle SSL termination.

## 5. Deployment Steps

### 5.1. Apply Manifests

Apply the Kubernetes manifests in the correct order.

```bash
# 1. Create Namespaces
kubectl apply -f kubernetes/namespaces.yml

# 2. Create Secrets (as shown above)

# 3. Deploy Databases
kubectl apply -f kubernetes/storageclass.yml
kubectl apply -f kubernetes/databases.yml

# 4. Deploy Application Services
kubectl apply -f kubernetes/api-gateway.yml
kubectl apply -f kubernetes/frontend.yml
kubectl apply -f kubernetes/auth-service.yml
kubectl apply -f kubernetes/products-api.yml
kubectl apply -f kubernetes/cart-api.yml

# 5. Deploy Ingress
kubectl apply -f kubernetes/ingress.yml
```

### 5.2. Verify Deployment

Check the status of the deployed resources.

```bash
# Check pods in all namespaces
kubectl get pods -A

# Check services
kubectl get services -n tussi-services

# Check Ingress and wait for IP address
kubectl get ingress -n tussi-services
```

It may take several minutes for the Ingress to be provisioned and for the SSL certificate to be active.

## 6. Accessing the Application

Once the Ingress has an IP address, you can access your services:

- **Frontend**: `https://[YOUR_DOMAIN]`
- **API Gateway**: `https://[YOUR_DOMAIN]/api/...`

You will need to configure your domain's DNS to point to the IP address of the GKE Ingress.

This plan provides a high-level overview. The next step is to create the detailed Kubernetes manifest files. 