# 🚀 TDD-Driven POS Engine
> **Status:** 🚧 Active Development (Core Infrastructure & Testing)

A professional-grade **Point of Sale (POS) backend** architected with TypeScript and a strict **Test-Driven Development (TDD)** philosophy. This project serves as a deep dive into scalable architecture, focusing on data integrity, real-time session management, and automated infrastructure testing.

---

## 🛠 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Language** | TypeScript |
| **Runtime** | Node.js / Express |
| **Database** | MongoDB (Mongoose) |
| **Caching** | Redis (Session Management) |
| **Container** | Docker |
| **Testing** | Vitest, Supertest |
| **Patterns** | Repository Pattern, Base Classes, Feature-Driven Design, MVC |

---

## 🏗 Architecture & Design Patterns

The project follows a **Feature-Based Architecture**, ensuring that each domain (Auth, Product, Sales) is self-contained yet benefits from a robust shared infrastructure.

### 🧩 Shared Base Layer
High code reusability is achieved via abstract classes in the `shared/` directory:
* `BaseService`: Common business logic patterns.
* `CrudRoute`: Standardized routing for resource management.
* `CrudRepository`: Abstracted Mongoose operations.
* `BaseModel`: Unified schema configurations.

### ⚖️ Layered Responsibility
* **Controllers:** Handle HTTP requests and responses only.
* **Services:** Execute core business logic and orchestration.
* **Repositories:** Abstract database operations to keep services clean.
* **Validations:** Strict schema enforcement using **Joi/Zod**.
* **Centralized Error Handling:** Custom `httpErrors` and a guard system to prevent unhandled crashes.
* **Logging:** Structured logging using **Winston**.

---

## ✨ Features
*  **Auth:** Role-based authentication system (RBAC).
*  **Multi-tenancy:** Isolated data management for multiple businesses.
*  **Inventory:** Full product and stock management.
*  **Onboarding:** Invite-based user activation and onboarding workflow.

---

## 📂 Project Structure

```text
src
├── features/         # Business domains (Modular design)
│   ├── auth/         # JWT & Redis session logic
│   ├── business/     # Multi-tenant business management
│   ├── category/     # Product categorization
│   ├── products/     # Inventory management
│   └── sales/        # Transaction processing
├── shared/           # Abstract Base Classes (The "Engine")
├── database/         # Global Schemas and Models
├── config/           # Connection management (App, DB, Redis)
├── middlewares/      # Auth, Error, and Log handlers
└── utils/            # Shared utilities (JWT, Password hashing)

├── docker-compose.yml # Infrastructure orchestration
├── Dockerfile         # App containerization
└── tests/             # Global test suites
