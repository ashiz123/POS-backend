# TO CREATE THE ORDER
 1. When the terminal is created of any business , User login to terminal
 2. User is associated with some businessId
 3. Than user can create the order. 
 4. Order is created on the basis of businessId, terminalId.
 5. When the order created successfully, It create the paymentIntentId , client_secret to client or frontend
 
# TO COMPLETE THE ORDER
1. When frontend receives that paymentIntendId, client_secret
2. Relying on of client_secret, it receives the payment, 
3. If the payment is success, It trigger the webhook, (Webhook is one of the function of stripe that trigger upon some   action performed inside stripe like paymentIntent or charge function )
4. Webhook is working in the backend.
5. When the webhook is triggered as success, than it call orderService.completeOrder()
6. completeOrder() - Update the status of order created, Create the payment and update the stock by decreasing the sale product.

# TESING PROCESS
1. Login the terminal using postman for now.
2. Use that token to create the order using frontend localhost:5173
3. Login or connect the terminal
4. when order created, Make the payment for that order 
5. If the order payment done successfully update the order, payment and stock record.
