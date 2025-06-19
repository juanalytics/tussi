# Reporte de Vulnerabilidades

Este documento detalla las vulnerabilidades de seguridad identificadas en el proyecto, basadas en el análisis de los documentos de Common Weakness Enumeration (CWE).

## VUL-001: Uso de Credenciales Hardcodeadas (CWE-798)

**Descripción:**
El archivo `docker-compose.yml` contiene múltiples credenciales (secretos de JWT, usuarios y contraseñas de bases de datos) que están codificadas directamente en el archivo. Esto representa un riesgo de seguridad grave, ya que cualquier persona con acceso al repositorio de código puede obtener acceso a los servicios y a las bases de datos.

Referencia: [CWE-798: Use of Hard-coded Credentials](https://cwe.mitre.org/data/definitions/798.html)

**Instancias encontradas en `docker-compose.yml`:**

1.  **API Gateway (`api-gateway`):**
    -   `JWT_SECRET=supersecretkey`

2.  **Servicio de Autenticación (`auth-service`):**
    -   `DATABASE_URL=postgresql://authuser:supersecret@auth-db:5432/auth` (Contraseña: `supersecret`)
    -   `JWT_SECRET=supersecretkey`

3.  **API de Productos (`products-api`):**
    -   `DATABASE_URL=postgresql://user:password@products-db:5432/products` (Contraseña: `password`)

4.  **API de Carrito (`cart-api`):**
    -   `MONGO_URI=mongodb://root:rootpassword@carts-db:27017/cart-service?authSource=admin` (Contraseña: `rootpassword`)
    -   `MONGO_USER=root`
    -   `MONGO_PASSWORD=rootpassword`

5.  **Base de Datos de Autenticación (`auth-db`):**
    -   `POSTGRES_PASSWORD: supersecret`

6.  **Base de Datos de Productos (`products-db`):**
    -   `POSTGRES_PASSWORD: password`

7.  **Base de Datos de Carritos (`carts-db`):**
    -   `MONGO_INITDB_ROOT_PASSWORD=rootpassword`

**Recomendación:**
Se debe evitar el uso de credenciales hardcodeadas. En su lugar, utilice variables de entorno gestionadas a través de un sistema de gestión de secretos (como Docker Secrets, HashiCorp Vault, o AWS Secrets Manager) y archivos `.env` que no se incluyan en el control de versiones.

---

## VUL-002: Requisitos de Contraseña Débiles (CWE-521)

**Descripción:**
El servicio de autenticación (`auth-service`) no implementa una política de contraseñas robusta. Permite a los usuarios crear contraseñas sin requisitos mínimos de complejidad, como longitud, uso de caracteres especiales, mayúsculas y minúsculas, o números. Las contraseñas débiles son susceptibles a ataques de fuerza bruta o de diccionario.

Referencia: [CWE-521: Weak Password Requirements](https://cwe.mitre.org/data/definitions/521.html)

**Ubicación:**
El problema se encuentra en la lógica de creación de usuarios, específicamente en la función `create_user` del archivo `services/auth-service/app/services/auth_service.py`. No hay validación de la fortaleza de la contraseña (`password`) antes de crear el hash.

**Recomendación:**
Implementar una política de contraseñas segura en el backend que requiera una longitud mínima (e.g., 12 caracteres) y una combinación de tipos de caracteres. Se debe informar al usuario sobre estos requisitos en la interfaz de registro.

---

## VUL-003: Expiración de Sesión Insuficiente (CWE-613)

**Descripción:**
La configuración del servicio de autenticación establece un tiempo de expiración para los tokens JWT de 36000 segundos (10 horas). Un período de validez tan prolongado para las sesiones de usuario aumenta el riesgo de seguridad. Si un token de acceso es comprometido (por ejemplo, a través de un ataque XSS o robo físico del dispositivo), un atacante tendría una ventana de tiempo muy amplia para realizar acciones no autorizadas en nombre del usuario.

Referencia: [CWE-613: Insufficient Session Expiration](https://cwe.mitre.org/data/definitions/613.html)

**Ubicación:**
La configuración se encuentra en el archivo `docker-compose.yml` para el servicio `auth-service`:
- `JWT_EXPIRATION=36000`

**Recomendación:**
Reducir significativamente el tiempo de vida de los tokens de acceso (e.g., 15-60 minutos). Para mantener la sesión del usuario por períodos más largos, se debe implementar un sistema de tokens de refresco (refresh tokens). Los tokens de refresco tienen un tiempo de vida más largo, se almacenan de forma segura y se utilizan únicamente para solicitar nuevos tokens de acceso.

---

## VUL-004: Exposición de Información Sensible en "Health Check" (CWE-200)

**Descripción:**
El endpoint `/health` del API Gateway revela información detallada sobre el estado de cada microservicio interno. En caso de que un servicio falle, el endpoint muestra el mensaje de error específico. Esta información puede ser utilizada por un atacante para entender la arquitectura interna del sistema, identificar qué servicios están fallando y potencialmente lanzar ataques más sofisticados aprovechando esa inestabilidad.

Referencia: [CWE-200: Exposure of Sensitive Information to an Unauthorized Actor](https://cwe.mitre.org/data/definitions/200.html)

**Ubicación:**
La lógica se encuentra en el `api-gateway/server.js`, en el manejador de la ruta `app.get('/health', ...)`:
```javascript
// ...
  res.status(allServicesUp ? 200 : 503).json({
    gateway: 'UP',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    services: serviceChecks // 'serviceChecks' contiene la información detallada
  });
//...
```

**Recomendación:**
El endpoint de health check público solo debería devolver un estado general del sistema (por ejemplo, un código de estado 200 OK si todo funciona, o 503 Service Unavailable si hay un problema crítico), sin detallar el estado de cada microservicio. La información detallada del estado de los servicios internos solo debería estar disponible a través de un endpoint administrativo protegido que requiera autenticación y autorización adecuadas, y ser consumida por sistemas de monitoreo internos.

---

## VUL-005: Inserción de Información Sensible en Logs (CWE-532)

**Descripción:**
El API Gateway registra en la consola los mensajes de error completos (`err.message`) provenientes de los microservicios cuando estos fallan. Si bien no se exponen directamente al cliente, estos logs pueden contener información sensible sobre la infraestructura interna (e.g., trazas de pila, mensajes de error de base de datos, problemas de conexión). Si un atacante logra acceder a los archivos de log del servidor, podría obtener información valiosa para realizar ataques más dirigidos.

Referencia: [CWE-532: Insertion of Sensitive Information into Log File](https://cwe.mitre.org/data/definitions/532.html)

**Ubicación:**
La lógica se encuentra en los manejadores `onError` de los proxies en `api-gateway/server.js`:
```javascript
// ...
  onError: (err, req, res) => {
    console.error('Error en Auth Service:', err.message); // Logging del error completo
    res.status(503).json({
      error: 'Servicio de autenticación temporalmente no disponible',
      // ...
    });
  }
//...
```
Esto se repite para los servicios de productos y carrito.

**Recomendación:**
Implementar un sistema de logging estructurado. En lugar de registrar el mensaje de error completo, se deben registrar códigos de error estandarizados y mensajes sanitizados. La información detallada del error solo debe registrarse en un nivel de log de "debug" que esté desactivado en producción, o ser enviada a un sistema de monitoreo de errores seguro (como Sentry o similar) en lugar de a los logs de texto plano. Además, se debe asegurar que los logs de producción tengan permisos de acceso restringidos.

---

## VUL-006: Ausencia de una Política de Seguridad de Contenido (CSP) Robusta (CWE-693)

**Descripción:**
El API Gateway utiliza el paquete `helmet` para establecer cabeceras HTTP de seguridad, lo cual es una buena práctica. Sin embargo, no se ha configurado una Política de Seguridad de Contenido (Content Security Policy, CSP). Una CSP es una capa de seguridad adicional que ayuda a detectar y mitigar ciertos tipos de ataques, principalmente Cross-Site Scripting (XSS) y ataques de inyección de datos. Sin una CSP, el navegador tiene menos restricciones sobre los recursos que puede cargar y ejecutar, lo que aumenta la superficie de ataque.

Referencia: [CWE-693: Protection Mechanism Failure](https://cwe.mitre.org/data/definitions/693.html) (subyacente, ya que un mecanismo de protección no se usa a su máximo potencial) y [Prevención de XSS](https://cwe.mitre.org/data/definitions/79.html).

**Ubicación:**
La configuración se encuentra en `api-gateway/server.js`. Aunque `app.use(helmet());` está presente, no se le pasan opciones para configurar una CSP específica.

```javascript
// ...
app.use(helmet());
// ...
```

**Recomendación:**
Configurar una política de seguridad de contenido (CSP) estricta a través de `helmet`. Esta política debe definir explícitamente los orígenes de confianza desde los cuales se permite cargar scripts, estilos, imágenes y otros recursos. Una política inicial podría ser:

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Idealmente, eliminar 'unsafe-inline'
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```
Esta política debería ser refinada para ajustarse a las necesidades específicas de la aplicación frontend (por ejemplo, si se usan fuentes de Google o scripts de analítica de terceros).

---

## VUL-007: Verificación de Token Ineficiente y Frágil (Concepto Arquitectónico)

**Descripción:**
El servicio de carrito (`cart-api`) no valida los tokens JWT de forma local e independiente. En su lugar, por cada solicitud que recibe, realiza una llamada de red síncrona al servicio de autenticación (`auth-service`) para validar el token. Este patrón de diseño arquitectónico crea una dependencia crítica y un cuello de botella.

Este enfoque tiene dos debilidades principales:
1.  **Cascada de Fallos:** Si el `auth-service` se vuelve lento o deja de estar disponible, el `cart-api` se vuelve completamente inoperable para cualquier ruta protegida, afectando la resiliencia y disponibilidad del sistema.
2.  **Consumo de Recursos No Controlado (CWE-400):** Se genera una llamada de red adicional por cada petición al `cart-api`, lo que incrementa la latencia para el usuario final y añade una carga de red y de procesamiento innecesaria al `auth-service`, pudiendo llevar a una degradación del rendimiento o a una denegación de servicio.

Referencia a Conceptos Arquitectónicos: Este diseño va en contra de los principios de arquitecturas de microservicios resilientes y débilmente acopladas. Se relaciona con **CWE-400 (Uncontrolled Resource Consumption)** por la sobrecarga que genera.

**Ubicación:**
La lógica se encuentra en el middleware `services/cart-api/src/middleware/auth.js`:

```javascript
// ...
    const response = await axios.get(`${process.env.AUTH_SERVICE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
// ...
```

**Recomendación:**
Refactorizar el middleware de autenticación en todos los servicios de backend (`cart-api`, `products-api`, etc.) para que realicen la validación del token JWT de forma local. Dado que el token está firmado con un secreto (`JWT_SECRET`) que puede ser compartido de forma segura entre los servicios, cada servicio puede verificar la firma y la expiración del token criptográficamente sin necesidad de una llamada de red al servicio de autenticación. Esto desacopla los servicios, mejora el rendimiento y aumenta la resiliencia del sistema.

---

## VUL-008: Autorización Inexistente en la API de Productos (CWE-285)

**Descripción:**
Los endpoints de la API de Productos (`products-api`) que modifican datos (crear, actualizar, eliminar) no implementan ningún tipo de mecanismo de autorización. Aunque el API Gateway comprueba la autenticación, el servicio de productos no valida que el usuario autenticado tenga los permisos necesarios para realizar estas acciones (por ejemplo, ser un administrador).

Peor aún, si un atacante logra eludir el API Gateway y acceder directamente al servicio, podría modificar y borrar productos sin estar autenticado. Esto viola el principio de "confianza cero" y la defensa en profundidad, ya que la seguridad de los datos depende exclusivamente de un único componente (el gateway).

Referencia: [CWE-285: Improper Authorization](https://cwe.mitre.org/data/definitions/285.html)

**Ubicación:**
Todo el archivo `services/products-api/app/routers/products_router.py` carece de dependencias de seguridad en sus endpoints de escritura. Por ejemplo:
```python
@router.post("/", response_model=product_schema.Product)
def create_product_endpoint(product: product_schema.ProductCreate, db: Session = Depends(get_db)):
    # No hay validación de rol o permisos
    return products_service.create_product(db=db, product=product)

@router.delete("/{product_id}", response_model=product_schema.Product)
def delete_product_endpoint(product_id: int, db: Session = Depends(get_db)):
    # No hay validación de rol o permisos
    db_product = products_service.delete_product(db, product_id=product_id)
    # ...
```

**Recomendación:**
1.  Implementar un sistema de autenticación local en `products-api` (similar a la VUL-007) para validar el token JWT en cada petición.
2.  Introducir un sistema de autorización basado en roles. El token JWT debería contener una claim de "rol" (ej. `'role': 'admin'`).
3.  Crear una dependencia de seguridad en FastAPI que verifique tanto la autenticación como que el rol del usuario sea el adecuado (`admin`) para poder acceder a los endpoints de escritura. Los endpoints de lectura (GET) pueden permanecer públicos.

---

## VUL-009: Endpoint de Administración Crítico sin Protección (CWE-284)

**Descripción:**
La API de Productos expone el endpoint `POST /products/populate`, que tiene la capacidad de ejecutar un script SQL para poblar la base de datos. Este endpoint no tiene ningún tipo de control de acceso. Cualquier persona (autenticada o no) que pueda alcanzar el servicio `products-api` puede invocarlo. Esto podría ser utilizado por un atacante para realizar un ataque de denegación de servicio, borrando y reescribiendo constantemente los datos de los productos, o para restaurar un estado de datos conocido y facilitar otros ataques.

Referencia: [CWE-284: Improper Access Control](https://cwe.mitre.org/data/definitions/284.html)

**Ubicación:**
El endpoint vulnerable se encuentra en `services/products-api/app/routers/products_router.py`:

```python
@router.post("/populate", summary="Populate database with sample products")
def populate_database(db: Session = Depends(get_db)):
    # ... ejecuta un archivo .sql ...
```

**Recomendación:**
Este tipo de funcionalidad de "seeding" o población de base de datos no debería exponerse a través de una API pública en un entorno de producción. Hay varias alternativas más seguras:
1.  **Eliminar el Endpoint:** Para producción, este endpoint debería eliminarse por completo del código.
2.  **Proteger el Endpoint:** Si se necesita para entornos de desarrollo o staging, debe ser protegido con el nivel más alto de autorización (ej. rol de super-administrador), y el API Gateway no debería exponer esta ruta públicamente.
3.  **Usar Jobs o Scripts de Migración:** La forma estándar de manejar la población de datos es a través de scripts de migración o jobs que se ejecutan como parte del proceso de despliegue (CI/CD) o manualmente por un administrador con acceso a la infraestructura, no a través de un endpoint de API.

--- 