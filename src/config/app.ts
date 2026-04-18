import express from 'express'
import cors from 'cors'
import { corsOptions } from '../middlewares/corsMiddleware.js'
import { errorHandler } from '../middlewares/errorHandler.js'
import authRoutes from '../features/auth/auth.route.js'
import categoryRoutes from '../features/category/category.route.js'
import businessRoutes from '../features/business/business.route.js'
import productRoute from '../features/products/product.route.js'
import userRoute from '../features/users/user.route.js'
import userActivationRoute from '../features/users/userActivation.route.js'
import businessActivationRoute from '../features/business/businessActivation.route.js'
import inventoryBatchRoute from '../features/inventory/inventoryBatchWithProduct.route.js'
import inventoryBatchWithoutProductRoute from '../features/inventory/inventoryBatchWithoutProduct.route.js'
import stripeTerminalRoute from '../features/stripe/stripeTerminal.routes.js'
import orderRoute from '../features/order/order.route.js'
import terminalRoute from '../features/terminal/terminal.route.js'
import notificationRoute from '../features/notification/notification.route.js'
import { webhookHandler } from '../features/stripe/stripeTerminal.controller.js'
// import { createBusinessRouter } from '../features/business/business.route.js'
// import { NotificationWorker } from '../workers/sendNotifictionWorker.js'
// import { container } from 'tsyringe'
// const businessRoute = createBusinessRouter(container)

const app = express()

//webhook route - its always on top
app.post(
    '/api/webhook',
    express.raw({ type: 'application/json' }),
    webhookHandler
)

app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// container.resolve(NotificationWorker).setup() //worker running here

// routes
app.use('/api/auth', authRoutes)
app.use('/api/business', businessRoutes)

//secure this route with business
app.use('/api/categories/', categoryRoutes)
app.use('/api/product', productRoute)
app.use('/api/user', userRoute)
app.use('/api/userActivation', userActivationRoute)
app.use('/api/businessActivation', businessActivationRoute)
app.use('/api/inventoryBatch', inventoryBatchRoute)
app.use('/api/inventoryBatch', inventoryBatchWithoutProductRoute)
app.use('/api/order', orderRoute)
app.use('/api/terminal', terminalRoute)
app.use('/stripe', stripeTerminalRoute)
app.use('/api/admin', notificationRoute)

// app.get('/api/health', (req, res) => {
//     res.status(200).json({ status: 'ok' })
// })
//

// middlewares at last after routes
app.use(errorHandler)

export default app
