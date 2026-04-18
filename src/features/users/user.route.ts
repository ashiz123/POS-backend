import { container } from 'tsyringe'
import { hasPermission } from '../../middlewares/hasPermission'
import { createCrudRoutes } from '../../shared/baseRouter'
import { TOKENS } from '../../config/tokens'
import { IUserController } from './user.type'
import { authWithBusinessHandler } from '../../middlewares/authWithBusinessHandler'
import { Request, Response, NextFunction } from 'express'

// authHandler, hasPermission('manage_users')

export default (req: Request, res: Response, next: NextFunction) => {
    const userController = container.resolve<IUserController>(
        TOKENS.USER_CONTROLLER
    )

    const router = createCrudRoutes(userController, {
        exclude: [],
        middleware: [authWithBusinessHandler, hasPermission('manage_users')],
    })

    return router(req, res, next)
}
