# Artifact

## 1. Team

**Name:** 1a  

**Team Members:**

- Xamir Ernesto Rojas Gamboa
- Juan Sebastian Medina Pinto
- Juan Manuel Pérez Ordoñez

## 2. Software System

### Name

Tussi

### Logo

![Tussi Logo](logo.png)

### Description}

**Tussi** is a distributed e-commerce platform built with modern microservices architecture that provides user authentication, product catalog management, and shopping cart functionality. The system is designed to handle high traffic loads through distributed services and uses modern web technologies for optimal performance and scalability.

The platform connects buyers and sellers in a highly scalable, modular, and secure environment, featuring decoupled microservices backed by PostgreSQL and MongoDB databases, with a frontend built using Next.js, React, and Tailwind CSS, plus a native mobile application for iOS and Android.

#### Key Features of Second Prototype

- **API Gateway Integration**: Centralized entry point for all client requests
- **Enhanced Security**: JWT-based authentication with middleware validation
- **Service Orchestration**: Improved service-to-service communication
- **Load Balancing**: Request distribution across microservices
- **Monitoring**: Health checks and centralized logging
- **Multi-Platform Support**: Web application and native mobile app for iOS/Android

#### Justification for Tussi's Name and Design

The name **Tussi** is intentionally provocative and disruptive—a metaphor to positively alter shopping experiences, creating emotional, sensory, and memorable interactions.

**Aesthetic and Visual Symbolism:** Intense pink color, animations, and "psychoactive" effects are deliberate emotional design choices, creating sensory engagement and visual differentiation.

**Target Audience:** Young adults interested in unconventional wellness (CBD, legal nootropics, holistic products), sustainable and disruptive fashion, and digital art and sensory items.

## 3. Architectural Structure

### Component-and-Connector View

Este sistema comprende dos clientes, un balanceador de carga, cuatro servicios y tres bases de datos, conectados por diez conectores.

- **Dos clientes**

  - **Component-1: Web Client**
  - **Component-2: Mobile Client**

- **Un balanceador de carga**

  - **Component-3: Load Balancer (Nginx)**

- **Cuatro servicios**

  - **Component-4: API Gateway Service**
  - **Component-5: Auth Service**
  - **Component-6: Products API**
  - **Component-7: Cart API**

- **Tres bases de datos**

  - **Component-8: Auth Database (PostgreSQL)**
  - **Component-9: Products Database (PostgreSQL)**
  - **Component-10: Cart Database (MongoDB)**

- **Diez conectores**

  1. **c1: HTTPS/HTTP** — Component-1 → Component-3 (expuesto)
  2. **c2: HTTPS/HTTP** — Component-2 → Component-3 (expuesto)
  3. **c3: HTTP (Load Balancing)** — Component-3 → Component-4
  4. **c4: HTTP (REST)** — Component-4 → Component-5
  5. **c5: HTTP (REST)** — Component-4 → Component-6
  6. **c6: HTTP (REST)** — Component-4 → Component-7
  7. **c7: TCP (PostgreSQL driver)** — Component-5 → Component-8
  8. **c8: TCP (PostgreSQL driver)** — Component-6 → Component-9
  9. **c9: TCP (MongoDB driver)** — Component-7 → Component-10
  10. **c10: HTTPS/HTTP (Testing)** — K6 Load Testing → Component-3

---

#### Components

1. **Component-1: Web Client**

   - Aplicación Next.js/React en el navegador.
   - Se comunica via HTTPS/HTTP con el Load Balancer.

2. **Component-2: Mobile Client**

   - App React Native en iOS/Android.
   - Se comunica via HTTPS/HTTP con el Load Balancer.

3. **Component-3: Load Balancer (Nginx)**

   - Punto de entrada único con terminación SSL/TLS.
   - Distribución de carga con algoritmo round-robin.
   - Redirección HTTP a HTTPS y manejo de certificados.
   - Balanceo entre múltiples instancias del API Gateway.

4. **Component-4: API Gateway Service**

   - Servicio de enrutamiento y proxy reverso.
   - JWT, rate limiting, CORS, logging y health checks.
   - Múltiples réplicas (4 instancias) para alta disponibilidad.

5. **Component-5: Auth Service**

   - FastAPI (Python).
   - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
   - Conexión TCP a PostgreSQL (Component-8).

6. **Component-6: Products API**

   - FastAPI (Python).
   - Endpoints: `GET /api/products`, `GET /api/products/{id}`.
   - Conexión TCP a PostgreSQL (Component-9).

7. **Component-7: Cart API**

   - Node.js/Express (TypeScript).
   - Endpoints: `GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/checkout`.
   - Conexión TCP a MongoDB (Component-10).

8. **Component-8: Auth Database (PostgreSQL)**

   - Puerto 5432.
   - Almacena credenciales y datos de usuario.

9. **Component-9: Products Database (PostgreSQL)**

   - Puerto 5433.
   - Almacena catálogo e inventario.

10. **Component-10: Cart Database (MongoDB)**

    - Puerto 27017.
    - Almacena sesiones y datos del carrito.

---

#### Connectors

| Conector | Tipo                    | Desde               | Hasta                 |
| -------- | ----------------------- | ------------------- | --------------------- |
| **c1**   | HTTPS/HTTP              | Web Client          | Load Balancer         |
| **c2**   | HTTPS/HTTP              | Mobile Client       | Load Balancer         |
| **c3**   | HTTP (Load Balancing)   | Load Balancer       | API Gateway           |
| **c4**   | HTTP (REST)             | API Gateway         | Auth Service          |
| **c5**   | HTTP (REST)             | API Gateway         | Products API          |
| **c6**   | HTTP (REST)             | API Gateway         | Cart API              |
| **c7**   | TCP (PostgreSQL driver) | Auth Service        | Auth Database         |
| **c8**   | TCP (PostgreSQL driver) | Products API        | Products Database     |
| **c9**   | TCP (MongoDB driver)    | Cart API            | Cart Database         |
| **c10**  | HTTPS/HTTP (Testing)    | K6 Load Testing     | Load Balancer         |

---

#### C&C Diagram

```mermaid
graph LR
    WebClient[Component-1<br/>Web Client]
    MobileClient[Component-2<br/>Mobile Client]
    LoadBalancer[Component-3<br/>Load Balancer<br/>Nginx]
    APIGateway[Component-4<br/>API Gateway Service<br/>4 replicas]
    AuthService[Component-5<br/>Auth Service]
    ProductsAPI[Component-6<br/>Products API]
    CartAPI[Component-7<br/>Cart API]
    AuthDB[Component-8<br/>PostgreSQL]
    ProductsDB[Component-9<br/>PostgreSQL]
    CartDB[Component-10<br/>MongoDB]
    K6[K6 Load Testing]

    WebClient -- "HTTPS c1" --> LoadBalancer
    MobileClient -- "HTTPS c2" --> LoadBalancer
    K6 -- "HTTP c10" --> LoadBalancer
    LoadBalancer -- "HTTP c3" --> APIGateway
    APIGateway -- "HTTP c4" --> AuthService
    APIGateway -- "HTTP c5" --> ProductsAPI
    APIGateway -- "HTTP c6" --> CartAPI
    AuthService -- "TCP 5432 c7" --> AuthDB
    ProductsAPI -- "TCP 5433 c8" --> ProductsDB
    CartAPI -- "TCP 27017 c9" --> CartDB

    subgraph "Public Network"
        WebClient
        MobileClient
        LoadBalancer
        APIGateway
        K6
    end

    subgraph "Private Network"
        AuthService
        ProductsAPI
        CartAPI
        AuthDB
        ProductsDB
        CartDB
    end
```

---

#### Description of Architectural Styles and Patterns Used

**Architectural Styles:**

1. **Microservices Architecture**
   - Distributed system with independently deployable services
   - Each service has isolated logic, databases, and Docker containers
   - **Advantages:** Parallel development, simplified maintenance, horizontal scalability

2. **Load Balancer + API Gateway Pattern**
   - **Load Balancer**: Single external entry point with SSL termination and traffic distribution
   - **API Gateway**: Internal service orchestration with authentication and routing
   - **NEW IN PROTOTYPE 2:** Enhanced high availability with multiple API Gateway replicas

3. **Container-based Architecture**
   - All system components run in Docker containers orchestrated by Docker Compose
   - **Advantages:** Consistent environments, simplified deployment, dependency isolation

4. **Database per Service Pattern**
   - Each microservice has its own dedicated database
   - **Advantages:** Data isolation, technology diversity, independent scaling

5. **Multi-Platform Client Architecture**
   - Web and mobile clients consuming the same backend services
   - **Advantages:** Code reuse, consistent user experience, unified API

6. **Continuous Testing Architecture**
   - **K6 Load Testing**: Automated performance testing service
   - **NEW IN PROTOTYPE 2:** Integrated load testing with performance monitoring
   - **Advantages:** Proactive performance validation, scalability verification

**Patterns:**

- **Server-Side Rendering (SSR)**: Next.js frontend with SSR capabilities
- **Circuit Breaker**: Implemented in API Gateway for fault tolerance
- **Health Check Pattern**: All services expose health endpoints
- **JWT Authentication**: Secure token-based authentication across services
- **Cross-Platform Data Synchronization**: Shared state management between web and mobile
- **Load Testing Pattern**: Automated performance testing with K6 service
- **SSL Termination Pattern**: Centralized SSL/TLS management at load balancer

#### Layered (Tier & Layer) View

```mermaid
graph TB
  subgraph "Tier 1: Presentation"
    WebClient["Web Client<br>(Next.js)"]
    MobileClient["Mobile Client<br>(React Native)"]
  end

  subgraph "Tier 2: Communication"
    APIGateway["API Gateway<br>(Node.js/Express)"]
  end

  subgraph "Tier 3: Logic"
    subgraph "L1: Controllers"
      AuthCtrl["Auth Controller"]
      ProdCtrl["Products Controller"]
      CartCtrl["Cart Controller"]
    end
    subgraph "L2: Services"
      AuthSvc["Auth Service"]
      ProdSvc["Products Service"]
      CartSvc["Cart Service"]
    end
    subgraph "L3: Models"
      UserModel["User Model<br>(ORM/ODM)"]
      ProductModel["Product Model<br>(ORM/ODM)"]
      CartModel["Cart Model<br>(ODM)"]
    end
  end

  subgraph "Tier 4: Data"
    AuthDB["Auth DB<br>(PostgreSQL)"]
    ProdDB["Products DB<br>(PostgreSQL)"]
    CartDB["Cart DB<br>(MongoDB)"]
    MobileStore["Mobile Local<br>Storage"]
  end

  WebClient      -->|HTTP| APIGateway
  MobileClient   -->|HTTP| APIGateway
  APIGateway     -->|REST| AuthCtrl
  APIGateway     -->|REST| ProdCtrl
  APIGateway     -->|REST| CartCtrl
  AuthCtrl       -->|calls| AuthSvc
  ProdCtrl       -->|calls| ProdSvc
  CartCtrl       -->|calls| CartSvc
  AuthSvc        -->|uses| UserModel
  ProdSvc        -->|uses| ProductModel
  CartSvc        -->|uses| CartModel
  UserModel      -->|persists| AuthDB
  ProductModel   -->|persists| ProdDB
  CartModel      -->|persists| CartDB
  MobileClient   -->|caches| MobileStore
```

**Tier 1: Presentation**

- **Web Client:** Next.js/React app running in the browser.
- **Mobile Client:** React Native app on iOS/Android.

**Tier 2: Communication**

- **API Gateway:** Node.js/Express service that centralizes routing, JWT auth, rate-limiting, CORS, load balancing and health checks for all client traffic.

**Tier 3: Logic**

- **L1 Controllers (Routing Layer):**

  - FastAPI routers (Auth, Products) and Express controllers (Cart) that validate HTTP requests and forward them to the service layer.
- **L2 Services (Business Logic Layer):**

  - Modular classes/functions encapsulating core use cases: user registration/login, catalog queries, cart operations, transaction management.
- **L3 Models (Data Access Layer):**

  - ORM/ODM schemas and repository interfaces for each domain entity (User, Product, Cart), isolating persistence logic.

**Tier 4: Data**

- **Auth DB:** PostgreSQL instance for user credentials and auth metadata.
- **Products DB:** PostgreSQL instance for product catalog and inventory.
- **Cart DB:** MongoDB instance for shopping cart sessions and items.
- **Mobile Local Storage:** AsyncStorage for offline caching of user preferences and session data.

### Deployment Structure

#### Deployment View

Container Orchestration Pattern with Docker Compose, network segmentation, and load balancing for high availability.

```mermaid
graph TD
    subgraph "Docker Host"
        subgraph "Public Network"
            LoadBalancerContainer["Load Balancer Container<br>(Nginx, Ports 80/443)"]
            FrontendContainer["Frontend Container<br>(Port 3000)"]
            APIGatewayContainer["API Gateway Container<br>(4 replicas, Port 9000)"]
            K6Container["K6 Load Testing<br>(Port 6565)"]
        end

        subgraph "Private Network (Internal Only)"
            AuthServiceContainer["Auth Service Container<br>(Port 8000)"]
            ProductsAPIContainer["Products API Container<br>(Port 8001)"]
            CartAPIContainer["Cart API Container<br>(Port 8002)"]
            AuthDBContainer["Auth DB Container<br>(PostgreSQL, Port 5432)"]
            ProductsDBContainer["Products DB Container<br>(PostgreSQL, Port 5433)"]
            CartDBContainer["Cart DB Container<br>(MongoDB, Port 27017)"]
        end

        LoadBalancerContainer -- "SSL Termination & Load Balancing" --> APIGatewayContainer
        FrontendContainer -- "Depends on" --> APIGatewayContainer
        APIGatewayContainer -- "Reverse Proxy" --> AuthServiceContainer
        APIGatewayContainer -- "Reverse Proxy" --> ProductsAPIContainer
        APIGatewayContainer -- "Reverse Proxy" --> CartAPIContainer
        AuthServiceContainer -- "Depends on" --> AuthDBContainer
        ProductsAPIContainer -- "Depends on" --> ProductsDBContainer
        CartAPIContainer -- "Depends on" --> CartDBContainer
        K6Container -- "Load Testing" --> LoadBalancerContainer
    end

    subgraph "Client Devices"
        UserDevice["User Device<br>(Browser)"]
        MobileDevice["Mobile Device<br>(iOS/Android)"]
        TestingDevice["Testing Environment<br>(K6 Scripts)"]
    end

    UserDevice -- "HTTPS/HTTP" --> LoadBalancerContainer
    UserDevice -- "HTTPS/HTTP" --> FrontendContainer
    MobileDevice -- "HTTPS/HTTP" --> LoadBalancerContainer
    TestingDevice -- "HTTP" --> K6Container

    subgraph "App Stores"
        AppStore["App Store / Google Play"]
    end

    MobileDevice -- "Installs from" --> AppStore

    subgraph "SSL/TLS"
        SSLCerts["SSL Certificates<br>(./ssl volume)"]
    end

    SSLCerts -- "Mounted to" --> LoadBalancerContainer
```

**Deployment Units:**

- **Load Balancer Container:** ⭐ **NEW**
  - Image: Custom Nginx build
  - Ports: `80:80` (HTTP redirect), `443:443` (HTTPS)
  - Dependencies: `api-gateway`
  - SSL/TLS: Certificate volume mount (`./ssl:/etc/ssl/certs`)
  - Features: SSL termination, HTTP to HTTPS redirect, round-robin load balancing
  - Network: `public` (external access)

- **Frontend Container:**
  - Image: Custom Next.js build
  - Ports: `3000:3000`
  - Dependencies: `api-gateway`
  - Environment: `NEXT_PUBLIC_API_GATEWAY_URL=https://localhost:443`
  - Network: `public`

- **Mobile Application:** ⭐ **NEW**
  - Platform: iOS/Android Native
  - Distribution: App Store/Google Play Store
  - Dependencies: Load Balancer (HTTPS endpoint)
  - Environment: `API_GATEWAY_URL=https://api.tussi.com` (production)
  - Local Storage: AsyncStorage for offline capabilities

- **API Gateway Container:** ⭐ **NEW**
  - Image: Custom Node.js build
  - Replicas: 4 instances for high availability
  - Dependencies: `auth-service`, `products-api`, `cart-api`
  - Environment:
    - `NODE_ENV=production`
    - `PORT=9000`
    - `JWT_SECRET=supersecretkey`
    - `AUTH_SERVICE_URL=http://auth-service:8000`
    - `PRODUCTS_SERVICE_URL=http://products-api:8000`
    - `CART_SERVICE_URL=http://cart-api:8000`
  - Health Check: `curl -f http://localhost:9000/health`
  - Networks: `public` (receives from load balancer), `private` (communicates with services)

- **K6 Load Testing Container:** ⭐ **NEW**
  - Image: `grafana/k6`
  - Ports: `6565:6565`
  - Volume: `./tests/k6:/scripts`
  - Dependencies: `load-balancer`
  - Network: `public`

- **Auth Service Container:**
  - Image: Custom FastAPI build
  - Ports: `8000:8000` (development/debug access)
  - Dependencies: `auth-db`
  - Environment: `DATABASE_URL=postgresql://authuser:supersecret@auth-db:5432/auth`
  - Health Check: `curl -f http://localhost:8000/health`
  - Network: `private` (isolated from external access)

- **Products API Container:**
  - Image: Custom FastAPI build
  - Ports: `8001:8000` (development/debug access)
  - Dependencies: `products-db`
  - Environment: `DATABASE_URL=postgresql://user:password@products-db:5432/products`
  - Health Check: `curl -f http://localhost:8000/health`
  - Network: `private` (isolated from external access)

- **Cart API Container:**
  - Image: Custom Node.js TypeScript build
  - Ports: `8002:8000` (development/debug access)
  - Dependencies: `carts-db`, `auth-service`
  - Environment: `MONGO_URI=mongodb://root:rootpassword@carts-db:27017/cart-service?authSource=admin`
  - Health Check: `curl -f http://localhost:8000/health`
  - Network: `private` (isolated from external access)

- **Database Containers:**
  - **Auth DB**: PostgreSQL 15 on port 5432, network: `private`
  - **Products DB**: PostgreSQL 15 on port 5433, network: `private`
  - **Cart DB**: MongoDB on port 27017, network: `private`

**Infrastructure:**

- **Network Segmentation**: 
  - **Public Network**: Load balancer, frontend, API Gateway, K6 testing
  - **Private Network**: All backend services and databases (internal=true, no external access)
- **Storage**: Docker volumes for database persistence
- **Monitoring**: Health checks for all services
- **Load Balancing**: Nginx handles SSL termination and distributes traffic across API Gateway replicas
- **Security**: SSL/TLS certificates, network isolation, reverse proxy pattern
- **Testing**: K6 load testing service for performance validation
- **Mobile Distribution**: Native app stores for iOS/Android deployment

### Decomposition Structure

#### Decomposition View

![decompositoon](decomposition.png)

```mermaid
graph TD
    subgraph "Tussi E-commerce Platform"
        subgraph "Module: Presentation"
            subgraph "Web Client (Next.js)"
                wc1["User Authentication (Login, Register pages)"]
                wc2["Product Discovery (Lists, Detail pages)"]
                wc3["Shopping Cart Management"]
                wc4["Responsive UI Components"]
            end
            subgraph "Mobile Client (React Native)"
                mc1["User Authentication (Login, Register screens)"]
                mc2["Product Discovery (Lists, Detail screens)"]
                mc3["Shopping Cart Management"]
                mc4["Offline Capabilities (AsyncStorage)"]
            end
        end

        subgraph "Module: Gateway"
            subgraph "API Gateway (Node.js)"
                gw1["Request Routing (to backend services)"]
                gw2["Authentication Middleware (JWT Validation)"]
                gw3["Rate Limiting & Security Policies"]
                gw4["Centralized Logging & Health Checks"]
                gw5["Endpoint Aggregation (/api/search)"]
            end
        end

        subgraph "Module: Business Services"
            subgraph "Authentication Service (FastAPI)"
                subgraph "User Management"
                    auth_reg["Register User"]
                    auth_profile["Get User Profile"]
                end
                subgraph "Session Management"
                    auth_login["Login User (issue JWT)"]
                    auth_verify["Verify JWT (used by gateway)"]
                end
            end
            subgraph "Products Service (FastAPI)"
                subgraph "Product Catalog"
                    prod_crud["Create, Read, Update, Delete Products"]
                    prod_list["List Products (with pagination)"]
                end
            end
            subgraph "Cart Service (Node.js)"
                subgraph "Cart Operations"
                    cart_get["Get User's Cart"]
                    cart_add["Add/Update Item in Cart"]
                    cart_remove["Remove Item from Cart"]
                    cart_clear["Clear Cart"]
                end
            end
        end

        subgraph "Module: Data Persistence"
            db_auth["Auth DB (PostgreSQL)<br/>Stores user credentials and profiles"]
            db_prod["Products DB (PostgreSQL)<br/>Stores product catalog and inventory"]
            db_cart["Cart DB (MongoDB)<br/>Stores shopping cart sessions and items"]
        end
    end
```

**Module Descriptions:**

- **Presentation Module**: Multi-platform presentation layer with a Next.js-based web frontend and a React Native mobile application. It provides the user interface for both web and mobile platforms, handling user interaction and communication with the API Gateway.
- **Gateway Module**: A centralized API Gateway built with Node.js that acts as a single entry point for all client requests. It is responsible for routing, authentication middleware, rate limiting, service discovery, and load balancing across the backend microservices.
- **Business Services Module**: A set of domain-specific microservices that implement the core business logic. This includes an **Authentication Service** (FastAPI) for user registration and login, a **Products Service** (FastAPI) for catalog management, and a **Cart Service** (Node.js) for shopping cart operations.
- **Data Persistence Module**: Implements a polyglot persistence strategy using multiple databases. It includes a PostgreSQL database for the **Auth Service**, another PostgreSQL database for the **Products Service**, and a MongoDB database for the **Cart Service**. This ensures data isolation and allows each service to use the most appropriate database technology.

**Functionalities Description**

- **User Management & Authentication**:
  - Secure user registration and login via the Authentication Service.
  - JWT-based session management, validated at the API Gateway.
  - Users can view and manage their profiles.
- **Product Catalog**:
  - Browse a list of products with details and pagination.
  - View detailed information for a single product.
  - (For admins) Create, update, and delete products from the catalog.
- **Shopping Cart**:
  - Authenticated users can add products to their shopping cart.
  - View the contents of the cart.
  - Update the quantity of items or remove them.
  - Clear the entire cart.
- **Cross-Cutting Concerns (Gateway)**:
  - Secure access to services with token validation.
  - Protect services from abuse with rate limiting.
  - Provide centralized health checks for monitoring system status.
  - Aggregate data from multiple services, such as enriching search results with cart information.

## 4. Quality Properties

### Security Scenarios

#### Man in the middle Attack

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>External Component"] --> B["<b>Stimulus:</b><br/>Attempt to intercept data in transit"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>Communication Channel (TLS/SSL)"]
    end
    
    C_sub --> D["<b>Response:</b><br/>Data travels encrypted, preventing unauthorized reading"]
    
    D --> E["<b>Metric:</b><br/>Data Confidentiality + Integrity"]
```

**Description:**

An attacker on an insecure network (e.g., public Wi-Fi) attempts to perform a man-in-the-middle (MITM) attack to intercept sensitive data, such as login credentials or personal information, being transmitted between a user's device and the Tussi backend.

| Part                   | Detail                                                                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | An attempt to intercept and read HTTP traffic between a client (web or mobile) and the API Gateway.                                                                    |
| **Source of stimulus** | An external attacker with access to the network path.                                                                                                                  |
| **Artifact**           | The communication channel between the client and the Load Balancer/API Gateway, secured with TLS/SSL.                                                                    |
| **Environment**        | A user is accessing the application from an untrusted public network.                                                                                                  |
| **Response**           | The system enforces HTTPS-only communication. All data in transit is encrypted via TLS, rendering any intercepted traffic unreadable to the attacker.                    |
| **Response metric**    | Data confidentiality and integrity are preserved. The percentage of non-encrypted connections should be 0%. Attempts to connect via HTTP are automatically rejected or upgraded. |

#### Attempt to Bypass API Gateway

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>External Client"] --> B["<b>Stimulus:</b><br/>Request to an internal microservice"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>Reverse Proxy (API Gateway)"]
    end
    
    C_sub --> D["<b>Response:</b><br/>The proxy validates and routes the request; the client never directly accesses the service"]
    
    D --> E["<b>Metric:</b><br/>Reduced Service Exposure + Isolation"]
```

**Description:**

A malicious actor, having discovered the potential internal IP address of a microservice, attempts to bypass the API Gateway and communicate directly with the `products-api` to exploit a potential vulnerability that the gateway's security filters would otherwise block.

| Part                   | Detail                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | A crafted HTTP request is sent directly to the internal IP or hostname of a backend microservice.                                                       |
| **Source of stimulus** | An external attacker or a compromised, non-critical external-facing service.                                                                            |
| **Artifact**           | The API Gateway, which serves as the single entry point, and the network configuration that isolates backend services.                                    |
| **Environment**        | Production. Backend services are running in a private network, inaccessible from the public internet.                                                   |
| **Response**           | The request fails because the private network is not exposed. The API Gateway is the only component listening for external traffic, and it validates, authenticates, and sanitizes all requests before forwarding them. |
| **Response metric**    | The attack surface is minimized by exposing only one entry point. The number of directly accessible internal service endpoints from an external source is zero. |

### Frontend Compromised

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>Attacker in compromised container"] --> B["<b>Stimulus:</b><br/>Attempt lateral movement to database"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>Docker Networks (npublic and private)"]
    end
    
    C_sub --> D["<b>Response:</b><br/>Docker network rules block traffic between isolated networks"]
    
    D --> E["<b>Metric:</b><br/>Zero connectivity between frontend and database networks"]
```

**Description:**

An attacker successfully exploits a vulnerability in the `frontend` service container. From this compromised position, they attempt to pivot and establish a direct connection to the `auth-db` (PostgreSQL database) to exfiltrate all user credentials.

| Part                   | Detail                                                                                                                                                                                                               |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | A connection attempt is made from the compromised `frontend` container to the `auth-db` container on its internal port (5432).                                                                                         |
| **Source of stimulus** | An attacker who has gained remote code execution within the `frontend` container.                                                                                                                                      |
| **Artifact**           | The Docker network configuration in `docker-compose.yml`, which defines two distinct networks: `public` for external-facing services and `private` (with `internal: true`) for the backend and databases.              |
| **Environment**        | Production Docker deployment. The `frontend` container is connected only to the `public` network, while the `auth-db` is exclusively on the `private` network.                                                           |
| **Response**           | The connection attempt from `frontend` to `auth-db` is blocked at the Docker network layer. Because the containers do not share a common network and the `private` network is isolated, no route exists between them. Only the API Gateway, which is connected to both, can bridge this gap. |
| **Response metric**    | Lateral movement from the presentation tier to the data tier is prevented. The number of unauthorized network paths between the `public` and `private` networks is zero. The blast radius of the frontend compromise is contained. |

#### Product Modification for Fraud (Auditability)

```mermaid
graph LR
    A["<b>Stimulus source:</b><br/> Legitimate administrator"] --> B["<b>Stimulus:</b><br/>Secret price modification"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>products-api + products-db"]
    end
    
    C_sub --> D["<b>Response:</b><br/> Immutable change log"]
    
    D --> E["<b>Metric:</b><br/>Complete and verifiable history"]
```

**Description:**

An administrator, using legitimate credentials, secretly changes the price of a high-value item to a very low price, makes a purchase, and then restores the original price to conceal the fraudulent activity.

| Part                   | Detail                                                                                                                                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | Price of a high-value product is changed to a very low amount and later restored.                                                               |
| **Source of stimulus** | Administrator with a legitimate account (no sign of compromise).                                                                                |
| **Artifact**           | `products-api` service and `products-db` database.                                                                                              |
| **Environment**        | Production, normal business operations.                                                                                                         |
| **Response**           | The system must immutably log every price change, including user, previous value, new value, and timestamp.                                     |
| **Response metric**    | Ability to generate a complete change history; prove that the price changed from X to Y and then from Y to X, with no possibility of tampering. |

---

### Performance Scenarios

#### API Gateway Instance Fail

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>Internal Failure"] --> B["<b>Stimulus:</b><br/>API Gateway instance crashes"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>Load Balancer + Replicated API Gateways"]
    end
    
    C_sub --> D["<b>Response:</b><br/>Load balancer detects failure and redirects traffic to healthy instances"]
    
    D --> E["<b>Metric:</b><br/>High Availability (>99.9%)"]
```

**Description:**

During a period of high traffic, one of the four replicated API Gateway container instances crashes due to an unexpected internal error, such as resource exhaustion or a process failure.

| Part                   | Detail                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | One of the API Gateway instances becomes unresponsive and fails its health check.                                                                                                                       |
| **Source of stimulus** | An internal system fault.                                                                                                                                                                               |
| **Artifact**           | The Nginx Load Balancer, the replicated API Gateway containers, and the health check mechanism.                                                                                                           |
| **Environment**        | Production environment, under normal to high load.                                                                                                                                                      |
| **Response**           | The load balancer, which continuously monitors the health of upstream services, detects that an instance is down. It immediately removes the failed instance from the pool and routes all incoming traffic to the remaining healthy instances. |
| **Response metric**    | System availability is maintained, with zero failed requests from the client's perspective after a brief connection-retry interval. The overall service experiences minimal to no degradation.             |

#### Increase on Concurrent Users

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>External Clients"] --> B["<b>Stimulus:</b><br/>Sudden surge in user traffic"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>Container Orchestrator + Load Balancer"]
    end
    
    C_sub --> D["<b>Response:</b><br/>Additional service instances are deployed and traffic is distributed"]
    
    D --> E["<b>Metric:</b><br/>Sustained Response Time + Resource Utilization"]
```

**Description:**

A successful marketing campaign results in a massive, sudden surge in concurrent users, causing CPU and memory utilization on the existing service containers to approach dangerous levels, threatening system-wide slowdowns.

| Part                   | Detail                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | The number of active users increases tenfold, from 1,000 to 10,000 in a few minutes.                                                                                                                                                                                                                                                                              |
| **Source of stimulus** | A large number of external web and mobile clients.                                                                                                                                                                                                                                                                                                               |
| **Artifact**           | The container orchestration setup (`docker-compose` with `deploy: replicas`) and the Nginx Load Balancer.                                                                                                                                                                                                                                                          |
| **Environment**        | Production, during a flash sale or major promotional event.                                                                                                                                                                                                                                                                                                      |
| **Response**           | An operator scales the number of replicas for the `api-gateway` and `products-api` services (e.g., using `docker-compose up --scale api-gateway=8`). The load balancer automatically discovers the new instances as they become healthy and begins distributing the traffic among the expanded pool, thus reducing the load on each individual container. |
| **Response metric**    | The average API response time remains below the 500ms target, and the CPU utilization across all instances is kept below 80%. The system successfully handles the increased load without a drop in performance.                                                                                                                                                   |

#### Denial Of Service Attack

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>Malicious Client/Script"] --> B["<b>Stimulus:</b><br/>Request flood to a specific endpoint"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>API Gateway Rate Limiting Middleware"]
    end
    
    C_sub --> D["<b>Response:</b><br/>Excessive requests from the source are blocked with HTTP 429"]
    
    D --> E["<b>Metric:</b><br/>Service Availability + Blocked Malicious Requests"]
```

**Description:**

A malicious actor or a poorly configured script begins to flood the `/api/auth/login` endpoint with hundreds of requests per minute from a single IP address in an attempt to guess passwords or cause a denial of service.

| Part                   | Detail                                                                                                                                                                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Stimulus**           | A single client IP sends over 100 requests to the `/api/auth/login` endpoint within a 60-second window.                                                                                                                                  |
| **Source of stimulus** | An external, automated script.                                                                                                                                                                                                          |
| **Artifact**           | The `express-rate-limit` middleware implemented in the API Gateway.                                                                                                                                                                       |
| **Environment**        | Production.                                                                                                                                                                                                                             |
| **Response**           | The API Gateway tracks the number of requests per IP. After the configured limit for authentication endpoints (5 requests per window) is exceeded, the gateway immediately begins rejecting subsequent requests from that IP with an HTTP 429 "Too Many Requests" error. |
| **Response metric**    | The `auth-service` is protected from the flood and its resources are not exhausted. The service remains fully available to legitimate users. The percentage of malicious requests that are successfully blocked after the limit is reached is 100%. |

#### Bottleneck on Write and Reads in Products database

```mermaid
graph LR
    A["<b>Stimulus Source:</b><br/>Concurrent Reads + Writes"] --> B["<b>Stimulus:</b><br/> Update Stock and Select Products"]
    
    B --> C_sub
    
    subgraph Environment
        C_sub["<b>Artifact:</b><br/>products-api + products-db"]
    end
    
    C_sub --> D["<b>Response:</b><br/> Handle Reads and Writes"]
    
    D --> E["<b>Metric:</b><br/> <350ms Read ; <1,5s Write "]
```

---

The product database experiences lockups when there are concurrent massive reads and simultaneous stock updates.

| Part                   | Detail                                                                                  |
| ---------------------- | --------------------------------------------------------------------------------------- |
| **Stimulus**           | An administrator updates stock while there is peak read load from web and mobile users. |
| **Source of stimulus** | Concurrent users (reads) and administrator (write).                                     |
| **Artifact**           | `products-api` service and PostgreSQL database `products-db`.                           |
| **Environment**        | Production, peak usage hours.                                                           |
| **Response**           | Serve reads quickly and process stock updates without prolonged lockups.                |
| **Response metric**    | Reads in < 350 ms; update confirmation in < 1.5 s; no deadlocks or write timeouts.      |

---

## 5. Architectural Styles

### Layered (N Tier)

The system is structured into four distinct tiers, promoting a clear separation of concerns. Tier 1 (Presentation) encompasses the web (Next.js) and mobile (React Native) clients. Tier 2 (Communication) is the API Gateway, which acts as a single entry point. Tier 3 (Logic) handles all business processes and is subdivided into Controllers, Services, and Models. Tier 4 (Data) includes the PostgreSQL and MongoDB databases. This layered approach simplifies development, testing, and maintenance by isolating responsibilities.

### client server: Network

The architecture follows a classic client-server model. The clients (web browser and mobile app) are decoupled from the backend services. They communicate via stateless HTTP requests to the server-side, which is fronted by the API Gateway. This fundamental separation allows the client and server components to be developed, deployed, and scaled independently.

#### Micro services: Service Based

The backend is decomposed into a set of independently deployable microservices. Each service (e.g., Authentication, Products, Cart) is aligned with a specific business capability, manages its own database, and runs in a separate Docker container. This service-based style enhances scalability, fault isolation, and technological flexibility, as each service can be developed and updated without impacting others.

#### polyglot Architecture

Tussi embraces a polyglot approach for both programming languages and data persistence. Services are built with the technology best suited for their function: Python with FastAPI for the Auth and Products services, and Node.js for the API Gateway and Cart service. Similarly, the data architecture uses both PostgreSQL for structured, relational data (Users, Products) and MongoDB for flexible, document-based data (Shopping Cart).

## 6. Architectural Patterns

### API Gateway Pattern

The API Gateway serves as a single, unified entry point for all client requests. It is responsible for routing traffic to the appropriate downstream microservice and centralizing cross-cutting concerns like JWT-based authentication, rate limiting, CORS policies, and centralized logging. This simplifies client logic and provides a robust control plane for the backend.

### Load Balancer Pattern: Round Robin Implementation

To ensure high availability and performance, the system employs a load balancer (Nginx) to distribute incoming traffic across multiple replicated instances of services like the API Gateway. It uses a round-robin strategy to balance the load, and by monitoring the health of each instance, it can automatically route traffic away from failed instances, thus preventing downtime.

#### Database per service Pattern

Each microservice has exclusive ownership of its own database, which is kept private and is not directly accessible by other services. The Auth and Products services each connect to a dedicated PostgreSQL instance, while the Cart Service uses its own MongoDB instance. This pattern guarantees loose coupling and allows each service to choose the most appropriate data model and technology.

### Server side rendering

The web application is built with Next.js and leverages Server-Side Rendering (SSR). When a user requests a page, it is rendered on the server into full HTML and then sent to the client. This pattern improves initial page load times and provides a better user experience, while also being highly beneficial for Search Engine Optimization (SEO).

### Secure Channel Pattern Architectural Tactic: Encrypt Data (Resist Attack)

To guarantee confidentiality and integrity, all data transmitted between clients and the API Gateway is encrypted using TLS/SSL (HTTPS). This application of the Secure Channel pattern is a critical security tactic to resist man-in-the-middle attacks and prevent eavesdropping on sensitive information, especially over untrusted networks.

### Load Balancer Pattern Architectural Tactic: Manage Resources & SSL Termination

The Load Balancer (Nginx) serves as the single entry point for all external traffic, handling SSL termination and distributing requests across multiple API Gateway replicas using round-robin algorithm. This pattern ensures high availability, improved performance, and centralized SSL/TLS management, reducing the computational overhead on backend services.

### Reverse Proxy Pattern Architectural Tactic: Limit Access (Resist Attack)

The system implements a two-tier reverse proxy architecture:
1. **Load Balancer**: Acts as the primary reverse proxy, handling SSL termination and routing to API Gateway instances
2. **API Gateway**: Acts as an internal reverse proxy, forwarding authenticated requests to backend microservices

This dual-layer approach completely hides the internal network topology and prevents any direct external access to individual services, effectively minimizing the system's attack surface.

### Network Segmentation Pattern Architectural Tactic: Limit Access (Resist Attack)

The system employs strict network segmentation using Docker's networking features:
- **Public Network**: Contains load balancer, frontend, API Gateway replicas, and K6 testing - accessible from external sources
- **Private Network**: Contains all backend services and databases with `internal: true` flag - completely isolated from external access
- **Cross-Network Communication**: Only the API Gateway can bridge between networks, acting as a controlled gateway

This segmentation ensures that even if the frontend or API Gateway is compromised, attackers cannot directly access backend services or databases, containing the blast radius of potential breaches.

### Performance Tactics Load Balancer Pattern Architectural Tactic: Maintain Multiple Copies of Computations (Manage Resources)

To manage system resources and maintain performance under heavy load, a load balancer is used to horizontally scale stateless services. By maintaining multiple copies of components like the API Gateway and distributing traffic among them, the system can handle a larger volume of concurrent computations, ensuring that response times remain low and preventing any single instance from becoming a bottleneck.

## 7. Prototype Deployment

### Prerequisites

- Docker and Docker Compose (version 3.8+)
- Node.js 18+ (for local development)
- Python 3.9+ (for local development)
- Poetry (for Python dependency management)
- React Native CLI (for mobile development)
- Xcode (for iOS development)
- Android Studio (for Android development)

### Local Deployment Instructions

**1. Clone the Repository:**

```bash
git clone [repository-url]
cd TUSSI/
```

**2. Environment Setup:**
The docker-compose.yml file contains all necessary environment variables. For local development, you may need to create `.env` files for each service.

**3. Build and Deploy Backend Services:**

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

**4. Database Initialization:**

```bash
# Wait for databases to be ready
docker-compose ps

# Populate products database
docker exec -it products-db psql -U user -d products
# Then run queries from products_dump.sql
```

**5. Mobile App Setup:**

```bash
# Navigate to mobile app directory
cd mobile-app/

# Install dependencies
npm install

# iOS setup
cd ios && pod install && cd ..

# Run on iOS simulator
npx react-native run-ios

# Run on Android emulator
npx react-native run-android
```

**6. Verify Deployment:**

```bash
# Check all containers
docker-compose ps

# Test health endpoints
curl http://localhost:9000/health    # API Gateway
curl http://localhost:8000/health    # Auth Service
curl http://localhost:8001/health    # Products API
curl http://localhost:8002/health    # Cart API

# Test mobile app connectivity
# Open mobile app and verify API connectivity
```

### Services Configuration

| Service         | External Port | Internal Port | Network  | Description |
|:----------------|:--------------|:--------------|:---------|:------------|
| **Load Balancer** | **80, 443**   | **80, 443**   | public   | **Nginx SSL Termination & Load Balancing** ⭐ **NEW** |
| **Frontend**    | 3000          | 3000          | public   | Next.js SSR Web Application |
| **Mobile App**  | N/A           | N/A           | N/A      | **Native iOS/Android Application** ⭐ **NEW** |
| **API Gateway** | N/A           | **9000**      | public, private | **Main API Gateway (4 replicas)** ⭐ **NEW** |
| **K6 Testing**  | 6565          | 6565          | public   | **Load Testing Service** ⭐ **NEW** |
| Auth Service    | 8000*         | 8000          | private  | Authentication & Authorization |
| Products API    | 8001*         | 8000          | private  | Product Catalog Management |
| Cart API        | 8002*         | 8000          | private  | Shopping Cart Operations |
| Auth DB         | 5432*         | 5432          | private  | PostgreSQL Auth Database |
| Products DB     | 5433*         | 5432          | private  | PostgreSQL Products Database |
| Cart DB         | 27017*        | 27017         | private  | MongoDB Cart Database |

**Note:** Ports marked with * are exposed for development/debugging purposes only. In production, only the Load Balancer (80/443) and Frontend (3000) should be externally accessible.

### Access Points

- **Primary Access** (Production): <https://localhost:443> (Load Balancer) ⭐ **NEW**
- **Web Application**: <http://localhost:3000>
- **Mobile Application**: Available on iOS/Android devices ⭐ **NEW**
- **Load Testing**: <http://localhost:6565> (K6 Dashboard) ⭐ **NEW**
- **API Documentation**:
  - Gateway: <https://localhost:443/docs> (Production) or <http://localhost:9000/docs> (Development)
  - Auth Service: <http://localhost:8000/docs> (Development only)
  - Products API: <http://localhost:8001/docs> (Development only)
  - Cart API: <http://localhost:8002/docs> (Development only)

## 8. Testing

### API Testing

All API endpoints are accessible through the Load Balancer and API Gateway from both web and mobile clients:

**Authentication:**

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

**Products:**

- `GET /api/products`
- `GET /api/products/{id}`

**Cart:**

- `GET /api/cart`
- `POST /api/cart/add`
- `POST /api/cart/checkout`

### Load Testing with K6 ⭐ **NEW**

The system includes automated load testing capabilities:

```bash
# Run K6 load tests
docker-compose exec k6 k6 run /scripts/test.js

# Monitor performance metrics
curl http://localhost:6565/metrics
```

**K6 Test Features:**
- **Stress Testing**: Simulates high concurrent user loads
- **Performance Metrics**: Response time, throughput, error rates
- **Scalability Validation**: Tests system behavior under load
- **Load Balancer Testing**: Validates traffic distribution across API Gateway replicas

### Mobile App Testing

- **Unit Tests**: React Native component testing with Jest
- **Integration Tests**: API connectivity and data synchronization
- **E2E Tests**: Full user flows on iOS and Android simulators
- **Device Testing**: Real device testing for iOS and Android
- **Load Testing**: Mobile app performance under various network conditions

### Health Monitoring

- **Primary Health**: `GET /health` (Load Balancer)
- **API Gateway Health**: `GET /api/health` (API Gateway instances)
- **Service Status**: `GET /api/status` (Overall system status)
- **Mobile Connectivity**: Built-in health checks within mobile app
- **SSL Certificate Status**: Automated certificate validation

## 9. Monitoring and Troubleshooting

### Application Logs

```bash
# View logs for specific service
docker-compose logs -f load-balancer
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f products-api
docker-compose logs -f cart-api
docker-compose logs -f k6

# View all logs
docker-compose logs -f
```

### Load Testing and Performance Monitoring

```bash
# Run K6 load tests
docker-compose exec k6 k6 run /scripts/test.js

# Monitor K6 dashboard
curl http://localhost:6565/

# Check load balancer metrics
docker-compose exec load-balancer nginx -s reload
```

### Mobile App Debugging

```bash
# iOS debugging
npx react-native log-ios

# Android debugging
npx react-native log-android

# Metro bundler logs
npx react-native start
```

### Common Issues

**Load Balancer Connection Issues:**

```bash
# Check load balancer status
curl -I https://localhost:443/health

# Verify SSL certificate
openssl s_client -connect localhost:443 -servername localhost

# Check load balancer logs
docker-compose logs -f load-balancer
```

**API Gateway Connection Issues:**

```bash
# Ensure all backend services are healthy
docker-compose exec api-gateway curl -f http://auth-service:8000/health
docker-compose exec api-gateway curl -f http://products-api:8000/health
docker-compose exec api-gateway curl -f http://cart-api:8000/health

# Check API Gateway replicas
docker-compose ps api-gateway
```

**Mobile App Connection Issues:**

```bash
# Check Load Balancer accessibility from mobile
curl https://[YOUR_LOCAL_IP]:443/health

# Verify mobile app configuration
# Check API_GATEWAY_URL points to load balancer (https://[YOUR_LOCAL_IP]:443)
```

**Network Segmentation Issues:**

```bash
# Verify network isolation
docker network ls
docker network inspect tussi_public
docker network inspect tussi_private

# Test that private services are not accessible externally
curl http://localhost:8000/health  # Should work (development)
# But private network services should not be accessible from outside Docker
```

**Database Connection Issues:**

```bash
# Check database health
docker-compose exec auth-db pg_isready -U authuser -d auth
docker-compose exec products-db pg_isready -U user -d products
docker-compose exec carts-db mongosh --eval "db.adminCommand('ping')"
```

## 10. Project Structure

```sh
TUSSI/
├── .gitignore
├── diagram.png                     # Architecture diagram
├── docker-compose.yml             # Container orchestration
├── logo.png                       # Tussi logo
├── products_dump.sql              # Sample products data
├── README.md                      # This documentation
├── api-gateway/                   # ⭐ NEW - API Gateway Service
│   ├── node_modules/
│   │   ├── Dockerfile
│   │   ├── package-lock.json
│   │   ├── package.json
│   │   └── server.js                  # Gateway routing logic
│   ├── frontend/                      # Next.js Frontend Application
│   │   ├── app/
│   │   │   ├── components/           # React components
│   │   │   ├── hooks/               # Custom React hooks
│   │   │   ├── lib/                 # Utility libraries
│   │   │   ├── public/              # Static assets
│   │   │   ├── services/            # API service calls
│   │   │   └── styles/              # CSS and styling
│   │   ├── components.json          # shadcn/ui configuration
│   │   ├── Dockerfile
│   │   ├── next-env.d.ts
│   │   ├── next.config.mjs
│   │   ├── package.json
│   │   ├── pnpm-lock.yaml
│   │   ├── postcss.config.mjs
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── web-app-manifest-512x512.png
│   ├── mobile-app/                   # ⭐ NEW - React Native Mobile Application
│   │   ├── android/                 # Android-specific files
│   │   │   ├── app/
│   │   │   ├── gradle/
│   │   │   └── build.gradle
│   │   ├── ios/                     # iOS-specific files
│   │   │   ├── TussiApp/
│   │   │   ├── TussiApp.xcodeproj/
│   │   │   └── Podfile
│   │   ├── src/                     # React Native source code
│   │   │   ├── components/          # Reusable components
│   │   │   ├── navigation/          # Navigation configuration
│   │   │   ├── screens/             # App screens
│   │   │   ├── services/            # API services
│   │   │   ├── store/               # State management
│   │   │   └── utils/               # Utility functions
│   │   ├── __tests__/               # Mobile app tests
│   │   ├── .eslintrc.js
│   │   ├── .prettierrc.js
│   │   ├── babel.config.js
│   │   ├── index.js                 # App entry point
│   │   ├── metro.config.js
│   │   ├── package.json
│   │   └── react-native.config.js
│   ├── nginx/                        # Optional Load Balancer
│   │   └── nginx.conf               # Nginx configuration
│   ├── services/                     # Microservices Directory
│   │   ├── auth-service/            # Authentication Microservice
│   │   │   ├── app/
│   │   │   │   ├── controllers/     # FastAPI route handlers
│   │   │   │   ├── models/          # SQLAlchemy models
│   │   │   │   └── services/        # Business logic
│   │   │   ├── database.py          # Database configuration
│   │   │   ├── deps.py              # Dependencies and middleware
│   │   │   ├── main.py              # FastAPI application entry
│   │   │   ├── schemas.py           # Pydantic schemas
│   │   │   ├── Dockerfile
│   │   │   ├── poetry.lock
│   │   │   ├── pyproject.toml       # Poetry configuration
│   │   │   └── requirements.txt     # Python dependencies
│   │   ├── cart-api/                # Cart Management Microservice
│   │   │   ├── node_modules/
│   │   │   ├── src/
│   │   │   │   ├── config/          # Database and app configuration
│   │   │   │   ├── controllers/     # Express route controllers
│   │   │   │   ├── middleware/      # Authentication middleware
│   │   │   │   ├── models/          # MongoDB models
│   │   │   │   ├── routes/          # API route definitions
│   │   │   │   ├── utils/           # Utility functions
│   │   │   │   └── index.js         # Application entry point
│   │   │   ├── .dockerignore
│   │   │   ├── .env                 # Environment variables
│   │   │   ├── .gitignore
│   │   │   ├── Dockerfile
│   │   │   ├── package-lock.json
│   │   │   └── package.json
│   │   └── products-api/            # Products Catalog Microservice
│   │       ├── app/
│   │       │   ├── db/              # Database utilities
│   │       │   ├── models/          # SQLAlchemy models
│   │       │   ├── routers/         # FastAPI routers
│   │       │   ├── schemas/         # Pydantic schemas
│   │       │   ├── services/        # Business logic services
│   │       │   └── __init__.py
│   │       ├── main.py              # FastAPI application entry
│   │       ├── tests/               # Unit tests
│   │       ├── Dockerfile
│   │       └── pyproject.toml       # Poetry configuration
```

### Architecture Insights from Project Structure

**Multi-Platform Presentation:**

- **Web Frontend** (`frontend/`): Next.js with React and TypeScript
- **Mobile Application** (`mobile-app/`): React Native with native iOS/Android support ⭐

**Microservices Distribution:**

- Each service (`auth-service`, `products-api`, `cart-api`) is completely isolated with its own:
  - Dependencies (`pyproject.toml`, `package.json`)
  - Dockerfile for containerization
  - Internal folder structure following best practices
  - Database models and business logic

**Technology Stack Evidence:**

- **Python Services** (`auth-service`, `products-api`): Use Poetry for dependency management and FastAPI framework
- **Node.js Services** (`cart-api`, `api-gateway`): Use npm/yarn with TypeScript support
- **Frontend**: Next.js with modern tooling (Tailwind, TypeScript, pnpm)
- **Mobile**: React Native with platform-specific configurations for iOS and Android

**Container Architecture:**

- Each backend component has its own `Dockerfile`
- `docker-compose.yml` orchestrates all backend services
- Mobile app deployed through native app stores

**API Gateway Integration:**

- Dedicated `api-gateway/` directory shows the centralized routing approach
- `server.js` contains the main gateway logic for request handling and service orchestration
- Supports both web and mobile client requests

**Database Strategy:**

- `products_dump.sql` indicates PostgreSQL usage for products
- MongoDB integration evident in `cart-api` structure
- Database per service pattern clearly implemented
- Mobile local storage for offline capabilities

## 12. References

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
- [Microservices Patterns](https://microservices.io/patterns/index.html)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Cross-Platform Development Best Practices](https://reactnative.dev/docs/platformspecific-code)
