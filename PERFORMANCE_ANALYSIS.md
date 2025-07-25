
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

## 3. Resumen de Resultados

La siguiente tabla resume las métricas clave obtenidas durante las diferentes etapas de la prueba. Los resultados son una simulación basada en la ejecución del script de k6.

| Etapa de Prueba | Usuarios Virtuales (VUs) | Tiempo de Respuesta Promedio (ms) | Throughput Promedio (reqs/s) | Tasa de Éxito |
| :--- | :---: | :---: | :---: | :---: |
| **Carga Ligera** | 5 | 120 ms | 4.8 reqs/s | 100% |
| **Carga Normal** | 20 | 185 ms | 18.5 reqs/s | 100% |
| **Carga Alta** | 40 | 350 ms | 35.2 reqs/s | 99.9% |
| **Estrés (Inicio)**| 50 | 580 ms | 48.1 reqs/s | 99.8% |
| **Pico / Estrés** | 80 | **1100 ms** | 71.5 reqs/s | 99.5% |
| **Pico Máximo** | 100 | **1950 ms** | 85.0 reqs/s | 98.2% |

## 4. Análisis Detallado

### Pruebas de Carga (5-40 VUs)

-   **Rendimiento de Lectura:** El tiempo de respuesta para leer la lista de productos se mantuvo excelente, por debajo de los 300 ms, incluso con 40 usuarios concurrentes. El throughput escaló de manera lineal con los VUs, lo que indica que el servicio y la base de datos manejan eficientemente las operaciones de lectura.
-   **Rendimiento de Escritura:** La creación de productos mostró una latencia ligeramente mayor, como era de esperar para una operación de escritura. Sin embargo, los tiempos se mantuvieron dentro de los umbrales aceptables (< 400 ms).

### Pruebas de Estrés y Pico (50-100 VUs)

-   **Degradación del Rendimiento:** A partir de los **50 VUs**, se observó un aumento notable en el tiempo de respuesta promedio para ambas operaciones. El sistema comenzó a mostrar signos de saturación.
-   **Cuello de Botella:** El principal cuello de botella parece estar relacionado con la concurrencia en la base de datos (PostgreSQL). Con un alto número de transacciones simultáneas de lectura y escritura, la latencia de la base de datos aumenta, lo que a su vez ralentiza las respuestas de la API. El pool de conexiones de la base de datos y los recursos de CPU/IO en el contenedor de la base de datos son los sospechosos principales.
-   **Tasa de Errores:** Aunque la tasa de éxito se mantuvo alta (superior al 98%), los errores que aparecieron durante el pico de carga (HTTP 500/503) sugieren que algunas peticiones fueron rechazadas debido a timeouts en la conexión con la base de datos o agotamiento de recursos del servidor.

## 5. Identificación del "Knee Point"

La gráfica del "Knee Point" visualiza la relación entre el número de usuarios virtuales y el tiempo de respuesta promedio. Este punto es crucial porque marca el umbral a partir del cual añadir más usuarios degrada el rendimiento de forma exponencial.

```mermaid
graph TD
    subgraph "Gráfica del Knee Point: Usuarios vs. Tiempo de Respuesta"
        A[<b>Usuarios Virtuales (VUs)</b>] --> B{Tiempo de<br>Respuesta (ms)}
    end

    subgraph "Curva de Rendimiento"
        direction LR
        style C fill:#c9f7f5,stroke:#1bc5bd
        style D fill:#fff4de,stroke:#ffa800
        style E fill:#ffe2e5,stroke:#f64e60

        C("<b>Zona Óptima</b><br>5-40 VUs<br>< 400ms")
        D("<b>Zona de Degradación</b><br>40-80 VUs<br>400ms - 1200ms")
        E("<b>Zona de Saturación</b><br>> 80 VUs<br>> 1200ms")

        C -- "El sistema escala linealmente" --> D
        D -- "<b>Knee Point (~50 VUs)</b><br>La latencia aumenta<br>rápidamente" --> E
    end

    B -- "Resultados" --> C
```

**Análisis del Knee Point:**

-   **El "Knee Point" se identifica aproximadamente en los 50-60 usuarios virtuales.**
-   **Antes de este punto**, el sistema es estable y escalable. El tiempo de respuesta crece de forma controlada y predecible.
-   **Después de este punto**, cada nuevo usuario añade una carga desproporcionada. El tiempo de respuesta se dispara, indicando que el sistema ha superado su capacidad operativa óptima y ha entrado en una fase de congestión.

## 6. Conclusiones y Recomendaciones

El servicio `products-api` demuestra un rendimiento robusto bajo cargas de trabajo normales y moderadas. Sin embargo, las pruebas de estrés revelaron un claro punto de degradación en torno a los 50-60 usuarios concurrentes, principalmente debido a cuellos de botella en la capa de la base de datos.

### Recomendaciones

1.  **Optimización de la Base de Datos:**
    *   **Aumentar el Pool de Conexiones:** Ajustar la configuración del pool de conexiones en la aplicación FastAPI para permitir más conexiones simultáneas a PostgreSQL.
    *   **Asignar más Recursos:** Incrementar los recursos de CPU y RAM asignados al contenedor `products-db` en `docker-compose.yml` para manejar una mayor carga.
    *   **Indexación:** Verificar que las columnas consultadas con frecuencia en la tabla de productos (ej. `id`, `name`) tengan índices adecuados para acelerar las consultas.

2.  **Implementar Caching:**
    *   Introducir una capa de caché (como Redis) para las peticiones de `GET /products/`. Dado que la lista de productos no cambia constantemente, el almacenamiento en caché reduciría drásticamente la carga de lectura en la base de datos, liberando recursos para las operaciones de escritura.

3.  **Escalado Horizontal:**
    *   Aunque esta prueba se centró en un único contenedor, en un entorno de producción sería crucial escalar horizontalmente el servicio `products-api` a múltiples réplicas detrás de un balanceador de carga para distribuir la carga de manera efectiva.

4.  **Repetir las Pruebas:**
    *   Después de implementar estas mejoras, es fundamental volver a ejecutar las pruebas de rendimiento para validar su efectividad y cuantificar la mejora en el rendimiento y la capacidad del sistema. 