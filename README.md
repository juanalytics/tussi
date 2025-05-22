## Running command
docker compose up --build

## Acces database when project is deployed. 
docker exec -it products-db psql -U user -d products
