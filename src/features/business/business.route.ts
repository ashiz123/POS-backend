import { createCrudRoutes } from '../../shared/baseRouter'
import { container, DependencyContainer } from 'tsyringe'
import { IBusinessController } from './business.type'
import { TOKENS } from '../../config/tokens'
import { authHandler } from '../../middlewares/authHandler'

export const businessRoute = (container: DependencyContainer) => {
    const businessController = container.resolve<IBusinessController>(
        TOKENS.BUSINESS_CONTROLLER
    )

    return createCrudRoutes(businessController, {
        exclude: [],
        middleware: [authHandler],
    })
}

export default businessRoute(container)
