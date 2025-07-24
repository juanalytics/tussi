# Deployment Script Fix Changelog

## Problem

When running `deploy.sh`, the following error occurred for all generated deployment YAML files:

```
error: error parsing deployment.yaml: error converting YAML to JSON: yaml: line 20: mapping values are not allowed in this context
```

This was caused by the image tag placeholder being replaced with a value that broke YAML syntax, likely due to multiple tags or malformed tag values from the `gcloud` command.

## Solution

- The script was updated to ensure only the first (most recent) tag is used for each microservice by piping the output through `head -n1 | cut -d',' -f1`.
- Debug output was added to print the tag values before running the `sed` replacements, making it easier to spot issues with tag values.

## How to Run

1. Make sure you are authenticated with GCP and have the required permissions.
2. Run the script from the `kubernetes` directory:
   ```bash
   ./deploy.sh
   ```
3. Check the output for the tag values and ensure there are no YAML parsing errors.
4. If errors persist, inspect the generated `.yaml` files at the reported line for syntax issues.

## How to Verify

- The script should print the tag values for each service.
- The generated YAML files should be valid and not cause parsing errors when applied with `kubectl`.
- The deployment should proceed without YAML syntax errors. 