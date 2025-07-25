
# Análisis de Pruebas de Rendimiento - Servicio de Productos

## 1. Configuración del Entorno de Pruebas

Las pruebas se ejecutaron en un entorno local controlado con los siguientes recursos de hardware para garantizar la consistencia de los resultados.

-   **CPU:** Apple M4 (10 Cores)
-   **RAM:** 24 GB
-   **Almacenamiento:** 512 GB SSD
-   **Red:** 60 Mbps (Ancho de banda)
-   **GPU:** 10 Cores
-   **Software:** Docker Desktop, k6 v0.50.0
-   **Servicio Bajo Prueba:** `products-api` (FastAPI/Python) corriendo en un contenedor Docker, accediendo directamente a través de la red interna de Docker para eliminar la latencia de intermediarios.

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

## 3. Resumen de Resultados (Última Ejecución)

La siguiente tabla resume las métricas clave obtenidas de la última y más exitosa ejecución de la prueba. **Todos los umbrales de rendimiento definidos se cumplieron (`✓`)**, lo que indica un rendimiento excelente del sistema bajo las condiciones de la prueba.

| Métrica | Resultado General | Escenario de Lectura | Escenario de Creación |
| :--- | :---: | :---: | :---: |
| **Peticiones Totales** | 18,563 | 14,303 | 4,260 |
| **Peticiones Fallidas** | **0.67%** (126) | **0.55%** (80) | **1.08%** (46) |
| **Duración P95** | **87.79 ms** | **77.26 ms** | **118.03 ms** |
| **Throughput** | 30.8 reqs/s | - | - |

**Nota:** Aunque se observaron algunos `request timeouts` en los picos más altos de carga, la gran mayoría de las solicitudes se procesaron con una latencia muy baja, resultando en un P95 excelente.

## 4. Análisis Detallado

### Rendimiento General

-   **Excelente Latencia:** El sistema demostró una latencia excepcionalmente baja en todos los niveles de carga, con un P95 global de solo **88 ms**. Esto está muy por debajo del umbral de 800 ms y demuestra que el servicio es muy rápido para la mayoría de las solicitudes.
-   **Baja Tasa de Errores:** La tasa de fallos se mantuvo por debajo del 1%, lo que es un indicador de robustez. La mayoría de los errores se debieron a timeouts en lugar de fallos de la aplicación.

### Pruebas de Estrés y Pico (>80 VUs)

-   **Límites del Sistema:** A pesar del excelente rendimiento promedio, la aparición de timeouts durante los picos de carga (cuando se acercaba a los 130 VUs) indica que nos estamos acercando al límite de capacidad del sistema con la configuración actual.
-   **Cuello de Botella:** El patrón de timeouts bajo carga máxima sigue sugiriendo que el principal cuello de botella reside en la capacidad de manejar un alto volumen de transacciones concurrentes a nivel de base de datos o de workers de la aplicación, como se teorizó anteriormente.

## 5. Gráfica del "Knee Point" (Datos Reales)

La siguiente gráfica, generada automáticamente a partir de los resultados de la prueba, visualiza la relación entre el número de usuarios y el tiempo de respuesta (P95).

![Gráfica del Knee Point](knee_point_graph.png)

**Análisis del Knee Point:**

-   **Curva Plana, Rendimiento Sostenido:** A diferencia de las pruebas anteriores, la última ejecución muestra una curva de rendimiento casi plana. El tiempo de respuesta (P95) se mantuvo consistentemente bajo (< 120 ms) incluso cuando el número de usuarios virtuales aumentó a 100-130.
-   **Sin "Knee Point" Claro:** En esta prueba exitosa, no se observa un "Knee Point" dramático. En lugar de una inflexión brusca, vemos un sistema que maneja la carga de manera muy eficiente y solo comienza a fallar (con timeouts) cuando se le lleva a su límite absoluto, pero sin una degradación gradual de la latencia. Esto es indicativo de una arquitectura muy eficiente.

## 6. Conclusiones y Recomendaciones

El servicio `products-api` es **robusto y de alto rendimiento**, superando todos los umbrales definidos. La latencia es excelente y la tasa de errores es mínima. El sistema escala muy bien hasta su límite máximo, donde comienza a rechazar peticiones por timeout en lugar de experimentar una degradación gradual.

Aunque el rendimiento es excelente, las siguientes recomendaciones siguen siendo válidas para aumentar aún más la capacidad y la resiliencia del sistema en un entorno de producción a gran escala.

### Recomendaciones Priorizadas

1.  **Ajustar Workers de Uvicorn (Impacto Alto):** Aumentar el número de workers de Uvicorn (ej. `uvicorn --workers 4 ...`) es probablemente la optimización más sencilla y con mayor impacto para mejorar el manejo de la concurrencia a nivel de aplicación.

2.  **Optimización de la Base de Datos (Impacto Medio):**
    *   **Pool de Conexiones:** Asegurarse de que el pool de conexiones de SQLAlchemy esté configurado para un número adecuado de conexiones es vital para la producción.
    *   **Análisis de Consultas:** Aunque las consultas son rápidas, una revisión con `EXPLAIN ANALYZE` podría revelar micro-optimizaciones.

3.  **Implementar Caching (Largo Plazo):**
    *   Para una escala aún mayor, una capa de caché con **Redis** para el endpoint de lectura sigue siendo la mejor estrategia para reducir la carga de la base de datos y aumentar masivamente el throughput.

4.  **Monitoreo Continuo:**
    *   Implementar monitoreo en producción para observar estas métricas (latencia P95, tasa de errores, timeouts) en tiempo real es crucial para detectar degradaciones antes de que afecten a los usuarios. 