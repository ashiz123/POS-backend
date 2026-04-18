import { TOKENS } from '../../config/tokens'
import { createCrudRoutes } from '../../shared/baseRouter'
import { IBusinessController } from './business.type'
import { container, DependencyContainer } from 'tsyringe'

export const CreateBusinessActivationRoute = (
    container: DependencyContainer
) => {
    const businessController = container.resolve<IBusinessController>(
        TOKENS.BUSINESS_CONTROLLER
    )

    return createCrudRoutes(businessController, {
        exclude: [],
        middleware: [],
        additionalRoute: [
            {
                name: 'business_activate',
                method: 'get',
                path: '/:userId/:token',
                handler: businessController.activateForm,
            },
            {
                name: 'update_business_activate',
                method: 'post',
                path: '/:userId/:token',
                handler: businessController.updateActivate,
            },
        ],
    })
}

export default CreateBusinessActivationRoute(container)
