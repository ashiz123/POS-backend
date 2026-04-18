import 'reflect-metadata'
import './config/container.js'
import './config/workers.js'
import { logger } from './middlewares/logHandler.js'
import '../src/core/notification.observer.js'
import { locationService } from './features/stripe/locationService.js'

async function bootstrap() {
    try {
        const port = process.env.PORT || 3000
        logger.info(`Starting application in ${process.env.NODE_ENV} mode`)
        console.log('Environment:', process.env.NODE_ENV, port)

        const { default: app } = await import('./config/app.js')

        logger.info('Connected to MongoDB successfully')

        const server = app.listen(port, async () => {
            console.log(`App listening on port ${port}`)
            logger.info(`App listening on port ${port}`)

            const location = await locationService()
            console.log('Stripe location created:', location.id)
        })

        server.on('error', (err) => {
            logger.error('Server error:', err)
        })
    } catch (err) {
        logger.error('Error during application bootstrap:', err)
    }
}

bootstrap()
