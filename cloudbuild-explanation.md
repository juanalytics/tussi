 # cloudbuild.yaml Explanation

## What does this file do?
This `cloudbuild.yaml` automates the process of building and pushing Docker images for all your main microservices and frontend to Google Artifact Registry. It is designed for use with Google Cloud Build, triggered by commits to your GitHub repository.

## How was it generated?
- **Services included:**
  - api-gateway
  - services/auth-service
  - services/cart-api
  - services/products-api
  - frontend
- **Image registry:**
  - All images are pushed to: `us-central1-docker.pkg.dev/tussi-466501/microservices-repo/[SERVICE-NAME]:$SHORT_SHA`
- **Tagging:**
  - Images are tagged with `$SHORT_SHA` (the short commit SHA for traceability)
- **No deployment step yet:**
  - This file currently only builds and pushes images. Deployment to GKE will be added later when your cluster and `kubectl` are ready.

## How to use
1. **Connect your GitHub repo to Google Cloud Build** (if not already done).
2. **Ensure Artifact Registry is set up** at `us-central1-docker.pkg.dev/tussi-466501/microservices-repo` and your Cloud Build service account has push permissions.
3. **On each commit**, Cloud Build will:
    - Build Docker images for each service and the frontend
    - Push them to Artifact Registry with the commit SHA as the tag
4. **Kubernetes manifests** are located in the `kubernetes/` folder for future deployment steps.

## Next steps
- When your GKE cluster is ready and `kubectl` is configured, deployment steps can be added to this file to automate rollout to your cluster.

---
If you need to customize the build (e.g., add build arguments, cache, or multi-stage builds), let me know! 