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

*   **User Management & Authentication**:
    *   Secure user registration and login via the Authentication Service.
    *   JWT-based session management, validated at the API Gateway.
    *   Users can view and manage their profiles.
*   **Product Catalog**:
    *   Browse a list of products with details and pagination.
    *   View detailed information for a single product.
    *   (For admins) Create, update, and delete products from the catalog.
*   **Shopping Cart**:
    *   Authenticated users can add products to their shopping cart.
    *   View the contents of the cart.
    *   Update the quantity of items or remove them.
    *   Clear the entire cart.
*   **Cross-Cutting Concerns (Gateway)**:
    *   Secure access to services with token validation.
    *   Protect services from abuse with rate limiting.
    *   Provide centralized health checks for monitoring system status.
    *   Aggregate data from multiple services, such as enriching search results with cart information.

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
