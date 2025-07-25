#!/bin/bash

# Este script automatiza la ejecución de las pruebas de rendimiento de k6
# y la posterior generación de la gráfica del Knee Point.

set -e # Exit immediately if a command exits with a non-zero status.

# --- 1. Definir rutas y nombres de archivo ---
# Rutas relativas al host para el script de Python y el output
HOST_GRAPH_OUTPUT="knee_point_graph.png"
HOST_PYTHON_SCRIPT="scripts/generate_graph.py"
HOST_REQUIREMENTS_FILE="scripts/requirements.txt"

# Rutas DENTRO del contenedor k6
CONTAINER_K6_SCRIPT="/scripts/products-performance-test.js"
CONTAINER_JSON_OUTPUT="/scripts/results.json"

# Ruta del archivo JSON en el host (donde Docker lo montará)
HOST_JSON_OUTPUT="tests/k6/results.json"


echo "================================================="
echo "===   Pipeline de Pruebas de Rendimiento      ==="
echo "================================================="

# --- 2. Instalar dependencias de Python ---
echo -e "\n[PASO 1/3] Instalando dependencias de Python desde $HOST_REQUIREMENTS_FILE..."
python3 -m pip install -r $HOST_REQUIREMENTS_FILE
echo "Dependencias instaladas."

# --- 3. Ejecutar prueba de rendimiento de k6 ---
echo -e "\n[PASO 2/3] Ejecutando prueba de k6..."
echo "Script a ejecutar dentro del contenedor: $CONTAINER_K6_SCRIPT"
echo "Guardando resultados en: $HOST_JSON_OUTPUT (via $CONTAINER_JSON_OUTPUT)"

# Usamos 'docker-compose run' para ejecutar la prueba en un contenedor efímero.
# El volumen en docker-compose.yml mapea ./tests/k6 a /scripts en el contenedor.
docker-compose run --rm k6 run $CONTAINER_K6_SCRIPT --out json=$CONTAINER_JSON_OUTPUT

echo "Prueba de k6 completada."

# --- 4. Generar la gráfica desde los resultados ---
echo -e "\n[PASO 3/3] Generando gráfica del Knee Point..."

if [ -f "$HOST_JSON_OUTPUT" ]; then
    echo "Ejecutando script de Python: $HOST_PYTHON_SCRIPT"
    python3 $HOST_PYTHON_SCRIPT $HOST_JSON_OUTPUT $HOST_GRAPH_OUTPUT
    echo "Gráfica generada en: $HOST_GRAPH_OUTPUT"
else
    echo "Error: No se encontró el archivo de resultados $HOST_JSON_OUTPUT. No se puede generar la gráfica."
    exit 1
fi

echo -e "\n================================================="
echo "===   Pipeline completado exitosamente        ==="
echo "=================================================" 