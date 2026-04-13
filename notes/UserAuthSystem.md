# USER AUTHENTICATION AND AUTHORIZTION

## Types of user authentication type
- Admin 
- Owner & Employee

## Admin flow
 - User register with following data
 {
     "email": "testing@gmail.com",
     "name": "testing only",
     "phone" : "23333322222",
     "password" : "testing123"
 
 }
 - User login with that credentials
 - OTP is sent to admin. Admin verify and authorize. (No business required)
 - User than pass the otp with email
   POST - http://localhost:3000/api/auth/verifyOTP
   body- {
       "email": "testing@gmail.com",
       "otp": "358581"
   }
 - token code is generated that have detail like email
 
 ## Owners and other role flow
  - User registered as above
  - user login and user detail like email are tokenize
    POST- http://localhost:3000/api/auth/login
    body- {
        "email": "testing@gmail.com",
        "otp": "358581"
    }
    response - user detail with token .
  - With that token and businessId another token is created
    POST - http://localhost:3000/api/auth/loginWithBusiness
    body - {
      "businessId : "344535" <objectId>
    }
    header - Authorization Bearer ---token---
    response - {userId, role, businessId} are stored in token(req.user)
