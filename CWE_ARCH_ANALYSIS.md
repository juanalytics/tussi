# Análisis de Vulnerabilidades Arquitectónicas (CWE)

Este documento evalúa cada una de las debilidades listadas en `cwe-software-arch.md` y determina su aplicabilidad en el contexto del proyecto.

---

### **J2EE Misconfiguration: Insufficient Session-ID Length**
- **Estado:** No Aplica.
- **Justificación:** El proyecto utiliza tokens JWT para la gestión de sesiones, no J2EE. La longitud y complejidad del token JWT son criptográficamente seguras por diseño.

### **External Control of System or Configuration Setting**
- **Estado:** Aplica.
- **Justificación:** El endpoint `POST /products/populate` en `products-api` permite a un actor externo (cualquier persona que pueda alcanzar el servicio) desencadenar una reconfiguración masiva del estado de la base de datos de productos. Esto se documenta en **VUL-009**.

### **Improper Input Validation**
- **Estado:** Potencialmente Aplicable.
- **Justificación:** Esta es una categoría muy amplia. No se ha realizado una auditoría exhaustiva de todos los campos de entrada en todos los servicios. Es probable que existan puntos donde la validación de entrada pueda ser mejorada, especialmente en los objetos `ProductCreate` y `ProductUpdate` del `products-api`.

### **External Control of File Name or Path**
- **Estado:** No Aplica.
- **Justificación:** El sistema no parece utilizar nombres de archivo o rutas controladas por el usuario para operaciones críticas. El endpoint `populate` utiliza una ruta de archivo fija (`/app/products_dump.sql`).

### **Improper Neutralization of Special Elements in Output Used by a Downstream Component ('Injection')**
- **Estado:** Potencialmente Aplicable.
- **Justificación:** La API de productos recibe datos del usuario (nombres de productos, descripciones) que luego se almacenan y se devuelven en las respuestas. Si estos datos no se sanitizan o codifican correctamente en el frontend, podrían dar lugar a ataques de XSS. La falta de una política CSP robusta (**VUL-006**) aumenta este riesgo.

### **Improper Neutralization of... ('Command Injection') / ('OS Command Injection') / ('Argument Injection')**
- **Estado:** No Aplica.
- **Justificación:** No se ha observado que los servicios construyan o ejecuten comandos del sistema operativo a partir de la entrada del usuario.

### **Improper Neutralization of Input During Web Page Generation ('Cross-site Scripting')**
- **Estado:** Aplica (Indirectamente).
- **Justificación:** La ausencia de una Política de Seguridad de Contenido (CSP) estricta en el API Gateway (`VUL-006`) es un fallo en el mecanismo de protección contra XSS. Aunque la vulnerabilidad se manifiesta en el frontend, la mitigación arquitectónica clave a nivel de gateway está ausente.

### **XML Injection (aka Blind XPath Injection)**
- **Estado:** No Aplica.
- **Justificación:** La arquitectura de la aplicación utiliza JSON para el intercambio de datos, no XML.

### **Improper Control of Filename for Include/Require Statement in PHP Program ('PHP Remote File Inclusion')**
- **Estado:** No Aplica.
- **Justificación:** El proyecto no utiliza PHP.

### **Improper Control of Resource Identifiers ('Resource Injection')**
- **Estado:** Aplica.
- **Justificación:** Los endpoints de `products-api` permiten la creación y modificación de recursos (productos) sin la autorización adecuada (`VUL-008`), lo que permite a un atacante "inyectar" o manipular recursos que no le pertenecen.

### **Generation of Error Message Containing Sensitive Information**
- **Estado:** Aplica.
- **Justificación:** El endpoint `/health` del API Gateway expone la estructura y el estado de los microservicios internos (`VUL-004`). Además, los logs del sistema registran mensajes de error detallados que podrían contener información sensible (`VUL-005`).

### **Invocation of Process Using Visible Sensitive Information**
- **Estado:** Potencialmente Aplicable.
- **Justificación:** Las credenciales se pasan como variables de entorno a los contenedores Docker. Si un atacante obtuviera acceso de ejecución dentro de un contenedor, podría leer estas variables.

### **Execution with Unnecessary Privileges**
- **Estado:** Aplica.
- **Justificación:** Por defecto, los contenedores Docker se ejecutan con el usuario `root`. Esto es un privilegio innecesario para las aplicaciones y viola el principio de privilegio mínimo.

### **Plaintext Storage of a Password / Use of Hard-coded Password / Password in Configuration File**
- **Estado:** Aplica.
- **Justificación:** El archivo `docker-compose.yml` contiene múltiples secretos, contraseñas y claves de API en texto plano (`VUL-001`).

### **Not Using Password Aging**
- **Estado:** Aplica.
- **Justificación:** El sistema no impone una política de rotación de contraseñas para los usuarios. Una vez creada, una contraseña puede ser válida indefinidamente, aumentando el riesgo si es comprometida.

### **Privilege Dropping / Lowering Errors / Improper Check for Dropped Privileges**
- **Estado:** Aplica.
- **Justificación:** Relacionado con "Execution with Unnecessary Privileges". Los procesos dentro de los contenedores no intentan bajar sus privilegios de `root` a un usuario con menos permisos.

### **Improper Access Control / Improper Authorization**
- **Estado:** Aplica.
- **Justificación:** Se han identificado múltiples fallos graves de control de acceso y autorización. Los endpoints de escritura de `products-api` carecen de validación de permisos (`VUL-008`), y el endpoint administrativo `populate` está completamente desprotegido (`VUL-009`).

### **Incorrect User Management**
- **Estado:** Aplica.
- **Justificación:** La falta de un sistema de roles o grupos en `products-api` significa que, implícitamente, todos los usuarios son tratados con los mismos permisos (acceso total si se elude el gateway), lo cual es una forma de gestión de usuarios incorrecta.

### **Authentication Bypass by Capture-replay**
- **Estado:** Potencialmente Aplicable.
- **Justificación:** La comunicación entre servicios y potencialmente entre el frontend y el gateway se realiza a través de HTTP, no HTTPS. Esto significa que los tokens JWT viajan sin cifrar por la red, y podrían ser capturados y reutilizados por un atacante en la misma red.

### **Improper Certificate Validation**
- **Estado:** No Aplica.
- **Justificación:** El sistema no utiliza validación de certificados ya que la comunicación es a través de HTTP plano. La vulnerabilidad real es la falta de TLS/HTTPS.

### **Channel Accessible by Non-Endpoint**
- **Estado:** Aplica.
- **Justificación:** La arquitectura permite el acceso directo a los microservicios de backend (ej. `products-api`, `cart-api`) sin pasar por el API Gateway, y estos servicios no realizan una autorización adecuada, confiando implícitamente en el gateway. Esto se relaciona con `VUL-008` y `VUL-009`.

### **Missing Critical Step in Authentication**
- **Estado:** Aplica.
- **Justificación:** El `cart-api` delega la validación de cada token al `auth-service`, en lugar de realizar la validación criptográfica localmente. Esto se considera un paso ineficiente y frágil en el flujo de autenticación, como se detalla en `VUL-007`.

### **Use of Single-factor Authentication**
- **Estado:** Aplica.
- **Justificación:** El sistema de autenticación se basa únicamente en un factor (contraseña). No ofrece opciones para autenticación de múltiples factores (2FA), lo cual es una práctica de seguridad estándar para proteger cuentas de usuario.

### **Cleartext Storage in a File or on Disk**
- **Estado:** Aplica.
- **Justificación:** Las credenciales hardcodeadas se almacenan en texto claro en el archivo `docker-compose.yml` en el disco (`VUL-001`).

### **Use of a Key Past its Expiration Date**
- **Estado:** Aplica.
- **Justificación:** Los tokens JWT tienen un tiempo de expiración excesivamente largo (10 horas), lo que aumenta la ventana de riesgo si un token es comprometido (`VUL-003`).

### **Inadequate Encryption Strength**
- **Estado:** Aplica (Parcialmente).
- **Justificación:** Se utiliza `HS256` para firmar los JWT. Este es un algoritmo simétrico, lo que significa que el mismo secreto (`JWT_SECRET`) debe estar presente en el `api-gateway`, `auth-service` y `cart-api`. Dada la vulnerabilidad de credenciales hardcodeadas (`VUL-001`), compartir este secreto de forma segura es problemático. Un algoritmo asimétrico (como `RS256`) sería arquitectónicamente más robusto, ya que los servicios de backend solo necesitarían la clave pública para verificar los tokens, no el secreto completo.

### **Session Fixation**
- **Estado:** No Aplica.
- **Justificación:** El mecanismo de autenticación basado en tokens JWT (donde el cliente solicita un token enviando credenciales) no es susceptible a los ataques clásicos de fijación de sesión.

### **Direct Request ('Forced Browsing')**
- **Estado:** Aplica.
- **Justificación:** Un atacante puede realizar peticiones directas a endpoints de API que no deberían ser accesibles o que deberían tener restricciones, como los endpoints de escritura de `products-api` (`VUL-008`).

### **Allocation of Resources Without Limits or Throttling**
- **Estado:** Aplica (Parcialmente).
- **Justificación:** El `api-gateway` implementa un limitador de tasa (`rate-limit`), lo cual es una excelente mitigación. Sin embargo, los servicios de backend (`products-api`, `cart-api`) no tienen sus propios limitadores de tasa. Si un atacante los alcanza directamente, podría intentar agotar sus recursos sin las restricciones impuestas por el gateway.

### **Insufficient Logging**
- **Estado:** Potencialmente Aplicable.
- **Justificación:** Si bien existe logging (`console.log`), no parece seguir un formato estructurado ni registrar eventos de seguridad clave (ej. intentos de acceso fallidos a endpoints de escritura, cambios de contraseña, etc.). Un sistema de logs robusto es crucial para la auditoría y la detección de incidentes.

### **Weak Password Requirements**
- **Estado:** Aplica.
- **Justificación:** El `auth-service` no impone ninguna política de complejidad para las contraseñas de los usuarios, permitiendo el uso de contraseñas débiles (`VUL-002`).

### **Reliance on Untrusted Inputs in a Security Decision**
- **Estado:** Aplica.
- **Justificación:** Los servicios de backend como `products-api` confían implícitamente en que la autenticación y autorización han sido manejadas por un componente externo (el gateway) y no validan por sí mismos. Esto es una forma de confiar en un input (la petición en sí) que podría provenir de una fuente no confiable si el gateway es eludido.

--- 