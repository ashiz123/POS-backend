# BUSINESS ONBOARDING LIFECYCLE


## OWNER REGISTERATION FLOWCHART
A([START]) --> B[/ POST http://localhost:3000/api/auth/register /]
B --> C{Is user already registered ?}

C --yes--> D[/ Throw: User already registered /]
D --> G([End])


C --No --> E[( User store in db )] 
E --> F[/ Success: User registered successfully/]

F --> G


## BUSINESS INITIALIZATION AND APPROVAL
A([Start]) --> B[/ POST http://localhost:3000/api/business/create with header Authorization token & request businessId /]
B --> C{Is User with business exist ?}

%% Failure Path: Not registered 
C --No --> D[/Throw: User is not registerd with business  /]
D --> E([End])

%% Success Path: Registered success
C --Yes --> F[( Business stored in Db)]
F --> G[Send create business request to admin]
G --> H[Admin review the business]
H --> I{Admin Decision?}

%% Final Branching 
I --Yes--> J[/ Business created successfully /]
I --No --> K[/ Creation of business is declined /]

J --> E
K --> E


## Two-Step Business Authentication flowchart
A([start]) --> B[/ POST api/auth/login  /]
B --> C[(Verify identity)]
C --> D[Generate Identity token]

D --> E[/ POST /api/auth/loginWithBusiness  with token and businessId /]
E --> F{User belongs to Business?}

F --No  -->  G[/ 403 forbidden error /]
F --Yes -->  H[/ Authenticated user with business token /]

H --> ([End : Access business Dashboard])


## Creating employee for business flowchart
A([start]) -->B[/ POST api/user/create /]
B --> C[(Save the user with Status: pending)]
C --> D[ Generate email with invitation token]
D --> E[ Employee clicks the link and set the new password]
E --> F[/ POST /api/userActivation/:businessId/token]
F --> G([ it call the hanlder userController.activateFormWithPassword])
G --> H[(Update the user & Status:Active )]
H --> I([End: Employee can login])
