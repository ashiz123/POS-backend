# BUSINESS ONBOARDING LIFECYCLE

This document outlines the complete technical flow for user registration, business initialization, authentication, and team expansion.

## Owner Registration Flow

This flow handles the initial creation of a user identity in the system.

```mermaid
graph TD
    A([START]) --> B[/POST /api/auth/register/]
    B --> C{Is user already<br/>registered?}

    C -- Yes --> D[/Throw: User already registered/]
    D --> G([END])

    C -- No --> E[(Store User in DB)]
    E --> F[/Response: User registered successfully/]
    F --> G

    style C fill:#fff4dd,stroke:#d4a017
    style E fill:#f9f,stroke:#333
    style D fill:#ffd2d2,stroke:#df4759

```

## Business Initialization & Approval

Once an identity exists, an owner can request to create a business entity, subject to admin verification.


```mermaid
graph TD
    A([Start]) --> B[/POST /api/business/create<br/>Header: Auth Token<br/>Body: businessId/]
    B --> C{User linked to<br/>Business?}

    %% Failure Path
    C -- No --> D[/Throw: User not registered/]
    D --> E([End])

    %% Success Path
    C -- Yes --> F[(Store Pending Business in DB)]
    F --> G[Notify Admin for Review]
    G --> H[Admin Reviews Request]
    H --> I{Admin Decision?}

    %% Final Branching 
    I -- Approved --> J[/Response: Business created successfully /]
    I -- Declined --> K[/Response: Creation declined/]

    J --> E
    K --> E

    style C fill:#fff4dd,stroke:#d4a017
    style I fill:#fff4dd,stroke:#d4a017
    style F fill:#f9f,stroke:#333
    style J fill:#d4edda,stroke:#28a745
    style K fill:#ffd2d2,stroke:#df4759
```

## Two-Step Business Authentication

Accessing the dashboard requires a two-stage token exchange to establish identity and then business context.


```mermaid
graph TD
    A([Start]) --> B[/POST /api/auth/login/]
    B --> C{Verify Credentials}
    C -.-> DB[(User DB)]
    
    C -- Valid --> D[Generate Identity Token]
    D --> E[/POST /api/auth/loginWithBusiness<br/>Body: businessId/]
    
    E --> F{User belongs to Business?}
    F -- No --> G[/403 Forbidden Error/]
    F -- Yes --> H[Generate Business Token]
    
    H --> I([End: Access Business Dashboard])

    style C fill:#fff4dd,stroke:#d4a017
    style F fill:#fff4dd,stroke:#d4a017
    style DB fill:#f9f,stroke:#333
    style H fill:#d4edda,stroke:#28a745

``` 

## Employee Onboarding (Invitation Flow)

Owners can invite employees, who must activate their accounts via a secure token.

```mermaid
 graph TD
    A([Start]) --> B[/POST /api/user/create/]
    B --> C[(Save User<br/>Status: PENDING)]
    
    C --> D[Generate & Send<br/>Invitation Token Email]
    D --> E[Employee Clicks Link<br/>& Sets Password]
    
    E --> F[/POST /api/userActivation/:businessId/:token/]
    F --> G[Handler: activateFormWithPassword]
    
    G --> H[(Update User<br/>Status: ACTIVE)]
    H --> I([End: Employee can login])

    style C fill:#f9f,stroke:#333
    style H fill:#f9f,stroke:#333
    style G fill:#e1f5fe,stroke:#01579b

```
