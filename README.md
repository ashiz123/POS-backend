-----TDD-Driven POS Engine-----(working on testing)

A professional-grade Point of Sale (POS) backend architected with TypeScript and a strict Test-Driven Development (TDD) philosophy. This project serves as a deep dive into scalable architecture, focusing on data integrity, real-time session management, and automated infrastructure testing.

-----Tech Stack------
Category	Technology
Language	TypeScript
Runtime	  Node.js / Express
Database	MongoDB (Mongoose)
Caching	  Redis (Session Management)
Container Docker
Testing	  Vitest, Supertest
Patterns	Repository Pattern, Base Classes, Feature-Driven Design, MVC


-----Architecture & Design Patterns-----
The project follows a Feature-Based Architecture, ensuring that each domain (Auth, Product, Sales) is self-contained yet benefits from shared infrastructure.

Shared Base Layer: High code reusability via shared/ classes like BaseService,CrudRoute, CrudRepository, and BaseModel.
Layered Responsibility:

Controllers: Handle HTTP requests and responses.
Services: Execute core business logic.
Repositories: Abstract database operations (Mongoose).
Validations: Strict schema enforcement using Joi/Zod.
Centralized Error Handling: Custom httpErrors and guard system to manage application flow and prevent "nasty" crashes.
Logging : Winston logger


-----Features---------
Role based authentication system
Multi-tenant system
Inventory management
Onboarding system with invite based user activation



-----Project Structure------

src
├── features/        # Business domains (Modular design)
│   ├── auth/        # JWT & Redis session logic
│   ├── business/    # Multi-tenant business management
│   ├── category/    # Product categorization
│   ├── products/    # Inventory management
│   └── sales/       # Transaction processing
├── shared/          # Abstract Base Classes (The "Engine")
├── database/        # Global Schemas and Models
├── config/          # Connection management (App, DB, Redis)
├── middlewares/     # Auth, Error, and Log handlers
└── utils/           # Shared utilities (JWT, Password hashing)

├── docker-compose.yml   # Infrastructure orchestration
├── Dockerfile           # App containerization            
└── tests/

----Project setup-----

#clone it -- https://github.com/ashiz123/typescript-pos-app.git


#start mongodb and redis containers (Fastest way to setup with docker)
docker-compose up -d

#install it
npm install

#Run test
npm test
