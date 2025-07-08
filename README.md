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

Este sistema comprende dos clientes, cuatro servicios y tres bases de datos, conectados por ocho conectores.

- **Dos clientes**

  - **Component-1: Web Client**
  - **Component-2: Mobile Client**

- **Cuatro servicios**

  - **Component-3: API Gateway Service**
  - **Component-4: Auth Service**
  - **Component-5: Products API**
  - **Component-6: Cart API**

- **Tres bases de datos**

  - **Component-7: Auth Database (PostgreSQL)**
  - **Component-8: Products Database (PostgreSQL)**
  - **Component-9: Cart Database (MongoDB)**

- **Ocho conectores**

  1. **c1: HTTP (REST)** — Component-1 → Component-3 (expuesto)
  2. **c2: HTTP (REST)** — Component-2 → Component-3 (expuesto)
  3. **c3: HTTP (REST)** — Component-3 → Component-4
  4. **c4: HTTP (REST)** — Component-3 → Component-5
  5. **c5: HTTP (REST)** — Component-3 → Component-6
  6. **c6: TCP (PostgreSQL driver)** — Component-4 → Component-7
  7. **c7: TCP (PostgreSQL driver)** — Component-5 → Component-8
  8. **c8: TCP (MongoDB driver)** — Component-6 → Component-9

---

#### Components

1. **Component-1: Web Client**

   - Aplicación Next.js/React en el navegador.
   - Se comunica via HTTP con el API Gateway.

2. **Component-2: Mobile Client**

   - App React Native en iOS/Android.
   - Se comunica via HTTP con el API Gateway.

3. **Component-3: API Gateway Service**

   - Entrada única para todos los clientes.
   - JWT, rate limiting, CORS, balanceo de carga, logging y health checks.

4. **Component-4: Auth Service**

   - FastAPI (Python).
   - Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`.
   - Conexión TCP a PostgreSQL (Component-7).

5. **Component-5: Products API**

   - FastAPI (Python).
   - Endpoints: `GET /api/products`, `GET /api/products/{id}`.
   - Conexión TCP a PostgreSQL (Component-8).

6. **Component-6: Cart API**

   - Node.js/Express (TypeScript).
   - Endpoints: `GET /api/cart`, `POST /api/cart/add`, `POST /api/cart/checkout`.
   - Conexión TCP a MongoDB (Component-9).

7. **Component-7: Auth Database (PostgreSQL)**

   - Puerto 5432.
   - Almacena credenciales y datos de usuario.

8. **Component-8: Products Database (PostgreSQL)**

   - Puerto 5433.
   - Almacena catálogo e inventario.

9. **Component-9: Cart Database (MongoDB)**

   - Puerto 27017.
   - Almacena sesiones y datos del carrito.

---

#### Connectors

| Conector | Tipo                    | Desde         | Hasta             |
| -------- | ----------------------- | ------------- | ----------------- |
| **c1**   | HTTP (REST)             | Web Client    | API Gateway       |
| **c2**   | HTTP (REST)             | Mobile Client | API Gateway       |
| **c3**   | HTTP (REST)             | API Gateway   | Auth Service      |
| **c4**   | HTTP (REST)             | API Gateway   | Products API      |
| **c5**   | HTTP (REST)             | API Gateway   | Cart API          |
| **c6**   | TCP (PostgreSQL driver) | Auth Service  | Auth Database     |
| **c7**   | TCP (PostgreSQL driver) | Products API  | Products Database |
| **c8**   | TCP (MongoDB driver)    | Cart API      | Cart Database     |

---

#### C&C Diagram

```mermaid
graph LR
    WebClient[Component-1<br/>Web Client]
    MobileClient[Component-2<br/>Mobile Client]
    APIGateway[Component-3<br/>API Gateway Service]
    AuthService[Component-4<br/>Auth Service]
    ProductsAPI[Component-5<br/>Products API]
    CartAPI[Component-6<br/>Cart API]
    AuthDB[Component-7<br/>PostgreSQL]
    ProductsDB[Component-8<br/>PostgreSQL]
    CartDB[Component-9<br/>MongoDB]

    WebClient -- "HTTP c1" --> APIGateway
    MobileClient -- "HTTP c2" --> APIGateway
    APIGateway -- "HTTP c3" --> AuthService
    APIGateway -- "HTTP c4" --> ProductsAPI
    APIGateway -- "HTTP c5" --> CartAPI
    AuthService -- "TCP 5432 c6" --> AuthDB
    ProductsAPI -- "TCP 5433 c7" --> ProductsDB
    CartAPI -- "TCP 27017 c8" --> CartDB
```

---

#### Description of Architectural Styles and Patterns Used

**Architectural Styles:**

1. **Microservices Architecture**
   - Distributed system with independently deployable services
   - Each service has isolated logic, databases, and Docker containers
   - **Advantages:** Parallel development, simplified maintenance, horizontal scalability

2. **API Gateway Pattern**
   - Single entry point for all client requests
   - Centralized routing, authentication, and cross-cutting concerns
   - **NEW IN PROTOTYPE 2:** Enhanced service orchestration and load balancing

3. **Container-based Architecture**
   - All system components run in Docker containers orchestrated by Docker Compose
   - **Advantages:** Consistent environments, simplified deployment, dependency isolation

4. **Database per Service Pattern**
   - Each microservice has its own dedicated database
   - **Advantages:** Data isolation, technology diversity, independent scaling

5. **Multi-Platform Client Architecture**
   - Web and mobile clients consuming the same backend services
   - **Advantages:** Code reuse, consistent user experience, unified API

**Patterns:**

- **Server-Side Rendering (SSR)**: Next.js frontend with SSR capabilities
- **Circuit Breaker**: Implemented in API Gateway for fault tolerance
- **Health Check Pattern**: All services expose health endpoints
- **JWT Authentication**: Secure token-based authentication across services
- **Cross-Platform Data Synchronization**: Shared state management between web and mobile

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

Container Orchestration Pattern with Docker Compose for backend services and native mobile app distribution.

```mermaid
graph TD
    subgraph "Docker Host"
        subgraph "Docker Network (microservices_network)"
            FrontendContainer["Frontend Container<br>(Port 3000)"]
            APIGatewayContainer["API Gateway Container<br>(Port 9000)"]
            AuthServiceContainer["Auth Service Container<br>(Port 8000)"]
            ProductsAPIContainer["Products API Container<br>(Port 8001)"]
            CartAPIContainer["Cart API Container<br>(Port 8002)"]
            AuthDBContainer["Auth DB Container<br>(PostgreSQL, Port 5432)"]
            ProductsDBContainer["Products DB Container<br>(PostgreSQL, Port 5433)"]
            CartDBContainer["Cart DB Container<br>(MongoDB, Port 27017)"]
        end

        FrontendContainer -- "Depends on" --> APIGatewayContainer
        APIGatewayContainer -- "Depends on" --> AuthServiceContainer
        APIGatewayContainer -- "Depends on" --> ProductsAPIContainer
        APIGatewayContainer -- "Depends on" --> CartAPIContainer
        AuthServiceContainer -- "Depends on" --> AuthDBContainer
        ProductsAPIContainer -- "Depends on" --> ProductsDBContainer
        CartAPIContainer -- "Depends on" --> CartDBContainer
    end

    subgraph "Client Devices"
        UserDevice["User Device<br>(Browser)"]
        MobileDevice["Mobile Device<br>(iOS/Android)"]
    end

    UserDevice -- "HTTP/S" --> FrontendContainer
    UserDevice -- "HTTP/S" --> APIGatewayContainer
    MobileDevice -- "HTTP/S" --> APIGatewayContainer

    subgraph "App Stores"
        AppStore["App Store / Google Play"]
    end

    MobileDevice -- "Installs from" --> AppStore
```

**Deployment Units:**

- **Frontend Container:**
  - Image: Custom Next.js build
  - Ports: `3000:3000`
  - Dependencies: `api-gateway`
  - Environment: `NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:9000`

- **Mobile Application:** ⭐ **NEW**
  - Platform: iOS/Android Native
  - Distribution: App Store/Google Play Store
  - Dependencies: API Gateway (remote)
  - Environment: `API_GATEWAY_URL=https://api.tussi.com` (production)
  - Local Storage: AsyncStorage for offline capabilities

- **API Gateway Container:** ⭐ **NEW**
  - Image: Custom Node.js build
  - Ports: `9000:9000`
  - Dependencies: `auth-service`, `products-api`, `cart-api`
  - Environment:
    - `NODE_ENV=production`
    - `PORT=9000`
    - `JWT_SECRET=your-secret-key`
    - `AUTH_SERVICE_URL=http://auth-service:8000`
    - `PRODUCTS_SERVICE_URL=http://products-api:8000`
    - `CART_SERVICE_URL=http://cart-api:8000`
    - `MOBILE_CLIENT_SUPPORT=true`
  - Health Check: `curl -f http://localhost:9000/health`

- **Auth Service Container:**
  - Image: Custom FastAPI build
  - Ports: `8000:8000`
  - Dependencies: `auth-db`
  - Environment: `DATABASE_URL=postgresql://authuser:supersecret@auth-db:5432/auth`
  - Health Check: `curl -f http://localhost:8000/health`

- **Products API Container:**
  - Image: Custom FastAPI build
  - Ports: `8001:8000`
  - Dependencies: `products-db`
  - Environment: `DATABASE_URL=postgresql://user:password@products-db:5432/products`
  - Health Check: `curl -f http://localhost:8000/health`

- **Cart API Container:**
  - Image: Custom Node.js TypeScript build
  - Ports: `8002:8000`
  - Dependencies: `carts-db`, `auth-service`
  - Environment: `MONGO_URI=mongodb://root:rootpassword@carts-db:27017/cart-service?authSource=admin`
  - Health Check: `curl -f http://localhost:8000/health`

- **Database Containers:**
  - **Auth DB**: PostgreSQL 15 on port 5432
  - **Products DB**: PostgreSQL 15 on port 5433
  - **Cart DB**: MongoDB on port 27017

**Infrastructure:**

- **Network**: Custom bridge network (`microservices_network`) for internal communication
- **Storage**: Docker volumes for database persistence
- **Monitoring**: Health checks for all services
- **Load Balancing**: API Gateway handles service routing and load distribution
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

## 5. Prototype Deployment

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

| Service         | External Port | Internal Port | Description |
|:----------------|:--------------|:--------------|:------------|
| **Frontend**    | 3000          | 3000          | Next.js SSR Web Application |
| **Mobile App**  | N/A           | N/A           | **Native iOS/Android Application** ⭐ **NEW** |
| **API Gateway** | **9000**      | **9000**      | **Main API Gateway** ⭐ **NEW** |
| Auth Service    | 8000          | 8000          | Authentication & Authorization |
| Products API    | 8001          | 8000          | Product Catalog Management |
| Cart API        | 8002          | 8000          | Shopping Cart Operations |
| Auth DB         | 5432          | 5432          | PostgreSQL Auth Database |
| Products DB     | 5433          | 5432          | PostgreSQL Products Database |
| Cart DB         | 27017         | 27017         | MongoDB Cart Database |

### Access Points

- **Web Application**: <http://localhost:3000>
- **Mobile Application**: Available on iOS/Android devices ⭐ **NEW**
- **API Gateway**: <http://localhost:9000> ⭐ **NEW**
- **API Documentation**:
  - Gateway: <http://localhost:9000/docs>
  - Auth Service: <http://localhost:8000/docs>
  - Products API: <http://localhost:8001/docs>
  - Cart API: <http://localhost:8002/docs>

## 6. Testing

### API Testing

All API endpoints are now accessible through the API Gateway from both web and mobile clients:

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

### Mobile App Testing

- **Unit Tests**: React Native component testing with Jest
- **Integration Tests**: API connectivity and data synchronization
- **E2E Tests**: Full user flows on iOS and Android simulators
- **Device Testing**: Real device testing for iOS and Android

### Health Monitoring

- **System Health**: `GET /health` (API Gateway)
- **Service Status**: `GET /api/status` (Overall system status)
- **Mobile Connectivity**: Built-in health checks within mobile app

## 7. Monitoring and Troubleshooting

### Application Logs

```bash
# View logs for specific service
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
docker-compose logs -f products-api
docker-compose logs -f cart-api

# View all logs
docker-compose logs -f
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

**API Gateway Connection Issues:**

```bash
# Ensure all backend services are healthy
docker-compose exec api-gateway curl -f http://auth-service:8000/health
docker-compose exec api-gateway curl -f http://products-api:8000/health
docker-compose exec api-gateway curl -f http://cart-api:8000/health
```

**Mobile App Connection Issues:**

```bash
# Check API Gateway accessibility from mobile
curl http://[YOUR_LOCAL_IP]:9000/health

# Verify mobile app configuration
# Check API_GATEWAY_URL in mobile app configuration
```

**Database Connection Issues:**

```bash
# Check database health
docker-compose exec auth-db pg_isready -U authuser -d auth
docker-compose exec products-db pg_isready -U user -d products
docker-compose exec carts-db mongosh --eval "db.adminCommand('ping')"
```

## 8. Architecture Compliance Checklist

- [x] **Distributed architecture** - Microservices with API Gateway orchestration
- [x] **Two presentation components** - Next.js web frontend + React Native mobile app ⭐
- [x] **Four logic components** - API Gateway, Auth Service, Products API, Cart API
- [x] **Communication/orchestration component** - API Gateway handles service orchestration ⭐
- [x] **Four data components** - Auth DB, Products DB, Cart DB + Mobile AsyncStorage ⭐
- [x] **Asynchronous processing** - Background tasks in services + mobile offline sync
- [x] **HTTP-based connectors** - REST API calls, Database connectors
- [x] **Four programming languages** - JavaScript/TypeScript, Python, SQL, HTML/CSS
- [x] **Container-oriented deployment** - Full Docker Compose orchestration + mobile distribution

## 9. Changes from Prototype 1 to Prototype 2

### Major Additions

1. **API Gateway Implementation** - Centralized request handling
2. **Enhanced Security** - JWT middleware at gateway level
3. **Service Orchestration** - Improved inter-service communication
4. **Health Monitoring** - Comprehensive health checks
5. **Load Balancing** - Request distribution capabilities
6. **Mobile Application** - Native iOS and Android app implementation ⭐
7. **Cross-Platform Support** - Unified API for web and mobile clients
8. **Offline Capabilities** - Mobile app offline data management

### Architecture Improvements

- **Centralized Routing**: All client requests go through API Gateway
- **Better Error Handling**: Standardized error responses
- **Enhanced Monitoring**: Centralized logging and health checks
- **Improved Security**: Authentication middleware at gateway level
- **Multi-Platform Support**: Native mobile experience with data synchronization
- **Offline-First Design**: Mobile app works without internet connectivity

## 10. Future Enhancements

- Advanced push notifications for mobile app
- Message queue integration (Redis/RabbitMQ)
- Advanced monitoring (ELK Stack)
- Caching layer (Redis)
- CI/CD pipeline implementation
- Kubernetes deployment
- App Store optimization and analytics
- Mobile app performance monitoring

## 11. Project Structure

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
