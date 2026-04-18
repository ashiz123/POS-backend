import { TOKENS } from '../../config/tokens'
import { createNonCrudRoutes } from '../../shared/nonCrudRouter'
import { container } from 'tsyringe'
import { IUserController } from './user.type'

const userController = container.resolve<IUserController>(
    TOKENS.USER_CONTROLLER
)

export default createNonCrudRoutes(userController, {
    exclude: [],
    middleware: [],
    additionalRoute: [
        {
            name: 'user_activate',
            method: 'get',
            path: '/:businessId/:token',
            handler: userController.activateFormWithPassword,
        },
        {
            name: 'update_user_Activate',
            method: 'post',
            path: '',
            handler: userController.updateActivate,
        },
    ],
})
