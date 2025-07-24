# Kubernetes Deployment Automation for Tussi Microservices

## Overview
This document explains the changes made to automate the deployment of all main microservices in the Tussi project using a single script. The updated process ensures that the latest Docker image tags are automatically fetched and applied to the Kubernetes deployment files for each service.

## What Was Changed

### 1. `deploy.sh` Script
- The script now fetches the latest Docker image tag for each microservice:
  - **frontend**
  - **auth-service**
  - **cart-api**
  - **products-api**
  - **api-gateway**
- For each service, it replaces the `REPLACE_WITH_TAG` placeholder in the corresponding deployment YAML file with the latest tag.
- The script generates new deployment files (e.g., `auth-deployment.generated.yaml`) and applies them to the Kubernetes cluster.

### 2. `api-gateway-deployment.yaml`
- The image line was updated to use the correct project ID and a `REPLACE_WITH_TAG` placeholder, making it compatible with the automation script.

## How to Use the New Deployment Script

1. **Ensure you are authenticated with Google Cloud and have the necessary permissions.**
2. **Run the script:**
   ```sh
   cd kubernetes
   ./deploy.sh
   ```
3. The script will:
   - Fetch the latest image tags for all microservices from Google Artifact Registry.
   - Replace the tag placeholders in the deployment YAMLs.
   - Apply the updated deployments to your GKE cluster.

## Deployment Files Affected
- `deployment.template.yaml` (frontend)
- `auth-deployment.yaml`
- `cart-deployment.yaml`
- `products-deployment.yaml`
- `api-gateway-deployment.yaml`

## Output
- The script generates new deployment files with the latest tags:
  - `deployment.yaml`
  - `auth-deployment.generated.yaml`
  - `cart-deployment.generated.yaml`
  - `products-deployment.generated.yaml`
  - `api-gateway-deployment.generated.yaml`

## Notes
- Make sure your Artifact Registry and Kubernetes cluster are set up and accessible.
- If you add new microservices, update the script to include them.
- The script assumes the `REPLACE_WITH_TAG` placeholder is present in the deployment YAMLs.

---

**For any issues or questions, refer to this document or contact the DevOps maintainer.** 