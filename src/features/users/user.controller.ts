import { Request, Response, NextFunction } from "express";
import { IUserController, IUserService } from "./user.type";
import { injectable, inject } from "tsyringe";
import {
  CreateUserValidation,
  UserRequest,
} from "./validations/createUserValidation";
import { ApiResponse } from "../../types/apiResponseType";
import { IUserProps } from "../auth/interfaces/authInterface";

import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors";
import { formWithPassword } from "../../utils/setPasswordForm";
import { TOKENS } from "../../config/tokens";
import { AuthRequestWithBusiness } from "../../shared/requestType";

@injectable()
export class UserController implements IUserController {
  constructor(@inject(TOKENS.USER_SERVICE) private userService: IUserService) {}

  create = async (
    req: AuthRequestWithBusiness,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      // Validation
      const validatedUser: UserRequest = CreateUserValidation.parse(req.body);

      if (!req.user) {
        throw new UnauthorizedError("User not found");
      }

      if (!req.user.businessId) {
        throw new UnauthorizedError("Business not found");
      }

      const { businessId } = req.user;

      const requestUserData = {
        ...validatedUser,
        businessId,
      };

      if (!req.user) {
        throw new UnauthorizedError("User not found");
      }

      const { userId } = req.user;
      const createUser = await this.userService.createUser(
        requestUserData,
        userId,
      );
      const response: ApiResponse<IUserProps> = {
        success: true,
        data: createUser,
        message: "New user created successfully",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  activateFormWithPassword = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, businessId } = req.params as {
        token: string;
        businessId: string;
      };
      if (!token) {
        throw new BadRequestError("Token is required");
      }
      res.send(formWithPassword(token, businessId));
    } catch (error) {
      next(error);
    }
  };

  updateActivate = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const { token, password, confirmPassword, businessId } = req.body;
      // const { businessId } = req.params

      if (!token) {
        throw new BadRequestError("Token is required");
      }

      if (password !== confirmPassword) {
        return next(new BadRequestError("Passwords do not match"));
      }

      const user = await this.userService.activateUserWithPassword(
        businessId,
        token,
        password,
      );

      if (!user) {
        throw new NotFoundError("User not found or could not be activated");
      }

      const response: ApiResponse<IUserProps> = {
        success: true,
        data: user,
        message: "User activated successfully",
      };
      if (response.success) {
        res.send(`
                <h2>Account Activated 🎉</h2>
                <p>Your password has been set successfully.</p>
                <a href="/api/auth/login">Go to Login</a>
              `);
      }
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     const userId: string = req.params.id
    //     // Validate update data
    //     const validatedData: UpdateUserRequest = UpdateUserValidation.parse(
    //         req.body
    //     )
    //     const updatedUser = await this.userService.update(
    //         userId,
    //         validatedData
    //     )
    //     if (!updatedUser) {
    //         throw new NotFoundError('User not found')
    //     }
    //     const response: ApiResponse<IUserProps> = {
    //         success: true,
    //         data: updatedUser,
    //         message: 'User updated successfully',
    //     }
    //     res.status(200).json(response)
    // } catch (error) {
    //     next(error)
    // }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     const allUsers = await this.userService.getAll()
    //     const response: ApiResponse<IUserProps[]> = {
    //         success: true,
    //         data: allUsers,
    //     }
    //     res.status(200).json(response)
    // } catch (error) {
    //     next(error)
    // }
  };

  listByBusiness = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("User not found");
      }

      const { businessId } = req.user;

      if (!businessId) {
        throw new NotFoundError("Business not found");
      }

      const userOfBusiness =
        await this.userService.getUserByBusiness(businessId);

      const response: ApiResponse<IUserProps[]> = {
        success: true,
        data: userOfBusiness,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     const userId: string = req.params.id
    //     const user = await this.userService.getById(userId)
    //     if (!user) {
    //         throw new NotFoundError('User not found')
    //     }
    //     const response: ApiResponse<IUserProps> = {
    //         success: true,
    //         data: user,
    //     }
    //     res.status(200).json(response)
    // } catch (error) {
    //     next(error)
    // }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     const userId: string = req.params.id
    //     const deleted = await this.userService.delete(userId)
    //     if (!deleted) {
    //         throw new NotFoundError(
    //             'User not found or could not be deleted'
    //         )
    //     }
    //     const response: ApiResponse<object> = {
    //         success: true,
    //         data: {},
    //         message: 'User deleted successfully',
    //     }
    //     res.status(200).json(response)
    // } catch (error) {
    //     next(error)
    // }
  };
}
