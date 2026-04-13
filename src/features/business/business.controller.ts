import { Request, Response, NextFunction } from "express";
import { BusinessProps } from "./business.model";
import { IBusinessService } from "./business.type";
import { IUserService } from "../users/user.type";
import { ApiResponse } from "../../types/apiResponseType";
import {
  BusinessSchemaValidation,
  type BusinessRequest,
} from "./validations/BusinessSchemaValidation";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../../errors/httpErrors";
import { businessActivationForm } from "../../utils/businessActivationHtml";
import { activationSuccess } from "../../utils/businessActivationHtml";
import { IBusinessController } from "./business.type";
import { injectable, inject } from "tsyringe";
import { TOKENS } from "../../config/tokens";

export interface AuthRequest extends Request {
  user?: { userId: string; email: string; role?: string };
}

@injectable()
export class BusinessController implements IBusinessController {
  constructor(
    @inject(TOKENS.BUSINESS_SERVICE)
    private readonly businessService: IBusinessService<BusinessProps>,
    @inject(TOKENS.USER_SERVICE)
    private readonly userService: IUserService,
  ) {}

  create = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Logged in user not found");
      }

      const data: BusinessRequest = BusinessSchemaValidation.parse(req.body); //validation
      const businessDataWithUser = {
        ...data,
        userId: req.user.userId,
        email: req.user.email,
      };
      const newBusiness: BusinessProps =
        await this.businessService.create(businessDataWithUser);
      //request to admin to create the business
      const response: ApiResponse<BusinessProps> = {
        success: true,
        data: newBusiness,
        message: "Business created successfully",
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const allBusiness = await this.businessService.getAll();
      const response: ApiResponse<BusinessProps[]> = {
        success: true,
        data: allBusiness,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const business = await this.businessService.getById(id);
      if (!business) {
        throw new NotFoundError("Business not found");
      }
      const response: ApiResponse<BusinessProps> = {
        success: true,
        data: business,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const updatedData: Partial<BusinessRequest> = req.body;
      const updatedBusiness = await this.businessService.update(
        id,
        updatedData,
      );
      if (!updatedBusiness) {
        throw new Error("Business is not updated");
      }

      const response: ApiResponse<BusinessProps> = {
        success: true,
        data: updatedBusiness,
        message: "Business updated successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  remove = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params as { id: string };
      const deletedBusiness = await this.businessService.delete(id);
      if (!deletedBusiness) {
        throw new Error("Business can not deleted");
      }
      const response: ApiResponse<object> = {
        success: true,
        data: {},
        message: "Business deleted successfully",
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  activateForm = (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, token } = req.params as {
        token: string;
        userId: string;
      };

      if (!token) {
        throw new BadRequestError("Token is required");
      }
      res.send(businessActivationForm(token, userId));
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
      const { token, userId } = req.params as {
        userId: string;
        token: string;
      };

      const userData = await this.userService.getUserById(userId);

      if (!userData) {
        throw new NotFoundError("User not found in database");
      }

      if (!token) {
        throw new BadRequestError("Token is required");
      }

      const user = await this.businessService.activateUser(
        token,
        userId,
        userData.email,
      );

      if (!user) {
        throw new NotFoundError("User not found or could not be activated");
      }

      const response: ApiResponse<string> = {
        success: true,
        data: "Business activated successfully",
        message: "User activated successfully",
      };
      if (response.success) {
        res.send(activationSuccess());
      }
    } catch (error) {
      next(error);
    }
  };
}
