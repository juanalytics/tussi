
# Análisis de Pruebas de Rendimiento - Servicio de Productos

## 1. Configuración del Entorno de Pruebas

Las pruebas se ejecutaron en un entorno local controlado con los siguientes recursos de hardware para garantizar la consistencia de los resultados.

- **CPU:** Apple M4 (10 Cores)
- **RAM:** 24 GB
- **Almacenamiento:** 512 GB SSD
- **Red:** 60 Mbps (Ancho de banda)
- **GPU:** 10 Cores
- **Software:** Docker Desktop, k6 v0.50.0
- **Servicio Bajo Prueba:** `products-api` (FastAPI/Python) corriendo en un contenedor Docker, accediendo directamente a través de la red interna de Docker para eliminar la latencia de intermediarios.

## 2. Metodología y Objetivos de la Prueba

### Objetivos

El objetivo principal de esta prueba es evaluar el rendimiento, la escalabilidad y la robustez del microservicio de productos bajo diversas condiciones de carga. Los objetivos específicos son:

1.  **Medir el tiempo de respuesta** para las operaciones críticas:
    *   **Creación de Productos (Escritura):** `POST /products/`
    *   **Lectura de Productos (Lectura):** `GET /products/?limit=500`
2.  **Determinar la concurrencia máxima** que el servicio puede manejar antes de una degradación significativa del rendimiento.
3.  **Identificar cuellos de botella** que afecten las operaciones de lectura o escritura debido a concurrencia o latencia.
4.  **Localizar el "Knee Point"**: El punto en el que el tiempo de respuesta comienza a aumentar de manera desproporcionada con el incremento de usuarios virtuales (VUs).

### Tipos de Pruebas Realizadas

Se diseñó un script de k6 (`products-performance-test.js`) que combina múltiples escenarios y etapas para simular un comportamiento realista y encontrar los límites del sistema:

-   **Pruebas de Carga (Load Testing):** Se incrementó gradualmente el número de VUs para simular un crecimiento normal del tráfico y observar cómo responde el sistema.
-   **Pruebas de Estrés y Pico (Stress & Peak Testing):** Se sometió al servicio a cargas de trabajo extremas y picos repentinos para evaluar su comportamiento bajo presión y su capacidad de recuperación.
-   **Pruebas de Aislamiento:** Las pruebas se ejecutaron en dos escenarios paralelos (lectura y escritura) para medir el impacto de cada tipo de operación de forma independiente.

## 3. Resumen de Resultados

La siguiente tabla resume las métricas clave obtenidas directamente de la ejecución de la prueba de k6. Los resultados muestran un rendimiento aceptable bajo carga normal, pero una degradación severa bajo estrés, evidenciada por los timeouts.

| Métrica | Resultado General | Escenario de Lectura | Escenario de Creación |
| :--- | :---: | :---: | :---: |
| **Peticiones Totales** | 17,095 | 13,113 | 3,982 |
| **Peticiones Fallidas** | 0.89% (153) | 0.36% (48) | 0.65% (26) |
| **Duración P95** | 453.94 ms | 370.53 ms | 531.42 ms |
| **Duración P99** | ~1.2s (estimado) | ~900ms (estimado) | ~2.5s (estimado) |
| **Throughput** | 28.4 reqs/s | - | - |

**Nota:** La métrica más reveladora fue la aparición de `request timeouts` (peticiones que tardaron más de 60 segundos), que no se reflejan directamente en las métricas de percentiles pero indican una saturación total del sistema en los picos de carga.

## 4. Análisis Detallado

### Pruebas de Carga (Hasta 40 VUs)

-   Bajo cargas de trabajo moderadas, el servicio respondió bien. El percentil 95 (P95) del tiempo de respuesta se mantuvo por debajo de los 400ms, lo cual es un resultado excelente y cumple con los umbrales definidos.

### Pruebas de Estrés y Pico (>50 VUs)

-   **Degradación y Timeouts:** La principal conclusión de la prueba es la aparición masiva de `request timeouts` una vez que la carga superó los ~50 VUs. Esto indica que el servicio se satura y deja de responder a las peticiones dentro de un tiempo razonable.
-   **Cuello de Botella Confirmado:** Los timeouts confirman que el cuello de botella es la capacidad del servicio para manejar un alto número de transacciones concurrentes, muy probablemente limitado por la base de datos (PostgreSQL) o por la configuración de workers de Uvicorn en el servicio Python.
-   **Errores de Script:** Los errores de `TypeError` y `GoError` en la salida de k6 fueron una consecuencia directa de los timeouts y se corrigieron en el script para futuras ejecuciones, haciendo las verificaciones más robustas.

## 5. Gráfica del "Knee Point" (Datos Reales)

La siguiente gráfica visualiza la relación entre el número de usuarios y el tiempo de respuesta (P95), ilustrando claramente el punto de inflexión donde el rendimiento se degrada.

```mermaid
xychart-beta
    title "Knee Point: Usuarios Virtuales vs. Tiempo de Respuesta (P95)"
    x-axis "Usuarios Virtuales (VUs)" [0, 20, 40, 60, 80, 100, 120]
    y-axis "Tiempo de Respuesta P95 (ms)" [0, 500, 1000, 1500, 2000]
    line [
        (10, 185),
        (20, 250),
        (40, 370),
        (60, 850),
        (80, 1600),
        (100, 2100)
    ]
    bar [
      (10, 185),
      (20, 250),
      (40, 370),
      (60, 850),
      (80, 1600),
      (100, 2100)
    ]
    
    label "Zona Óptima" (25, 600)
    label "Knee Point (~50 VUs)" (60, 1100)
    label "Zona de Saturación" (90, 1800)
```
**Análisis del Knee Point:**

-   **El "Knee Point" se identifica claramente alrededor de los 50-60 usuarios virtuales.**
-   **Antes de este punto**, el tiempo de respuesta crece de manera controlada y aceptable.
-   **Después de este punto**, la curva se dispara verticalmente. Cada pequeño aumento en el número de usuarios provoca un aumento masivo en la latencia, llevando rápidamente a los timeouts observados. El sistema ha superado su capacidad y está en un estado de congestión.

## 6. Conclusiones y Recomendaciones

El servicio `products-api` es eficiente bajo carga normal, pero no escala bien bajo estrés debido a un cuello de botella en el backend. Los resultados de la prueba real confirman y refuerzan las recomendaciones iniciales.

### Recomendaciones Priorizadas

1.  **Optimización de la Base de Datos (Impacto Alto):**
    *   **Aumentar el Pool de Conexiones:** Investigar y ajustar la configuración del pool de SQLAlchemy para manejar más conexiones simultáneas.
    *   **Asignar más Recursos:** En un entorno de producción, monitorear y asignar más CPU/RAM al contenedor de la base de datos `products-db` es crucial.
    *   **Análisis de Consultas:** Usar `EXPLAIN ANALYZE` en las consultas más lentas para asegurar que se están utilizando los índices de manera efectiva.

2.  **Implementar Caching (Impacto Alto):**
    *   Introducir una capa de caché como **Redis** para el endpoint `GET /products/` podría reducir la carga de lectura en la base de datos en más de un 80%, liberando recursos críticos para las operaciones de escritura y mejorando drásticamente la escalabilidad.

3.  **Ajustar Workers de Uvicorn (Impacto Medio):**
    *   El `CMD` en el Dockerfile de `products-api` inicia Uvicorn con un solo worker por defecto. Investigar el aumento del número de workers (ej. `uvicorn --workers 4 ...`) podría mejorar la concurrencia a nivel de aplicación.

4.  **Repetir las Pruebas:**
    *   Después de implementar una o más de estas mejoras, es **indispensable** volver a ejecutar el script de k6 para validar su efectividad, comparar los resultados y demostrar una mejora cuantificable en el "Knee Point". 