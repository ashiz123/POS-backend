import { inject, injectable } from "tsyringe";
import { IOrderController, IOrderService } from "./order.type";
import { Request, Response, NextFunction } from "express";
import { TOKENS } from "../../config/tokens";
import { OrderCreateValidation } from "./order.validation";
import { PaymentValidationSchema } from "../payment/payment.validation";
import { ApiResponse } from "../../types/apiResponseType";
import { OrderType } from "./order.model";
import { UnauthorizedError } from "../../errors/httpErrors";
import { AUTH_TYPE } from "../auth/user.constant";
import { IPaymentIntentDTO } from "../stripe/stripePayment.type";
import { RequestOrderItemType } from "./orderItems/orderItem.model";

@injectable()
export class OrderController implements IOrderController {
  constructor(
    @inject(TOKENS.ORDER_SERVICE) private orderService: IOrderService,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { businessId, terminalId } = req.terminal as {
        businessId: string;
        terminalId: string;
      };

      const { terminalSessionId, userId, type } = req.terminalUser as {
        terminalSessionId: string;
        name: string;
        email: string;
        role: string;
        userId: string;
        type: string;
      };

      if (type !== AUTH_TYPE.TERMINAL_ACCESS || !businessId || !terminalId) {
        throw new UnauthorizedError("User UnauthorizedError");
      }

      const parsedValidatedData = OrderCreateValidation.parse(req.body);

      const paymentToVerify = await this.orderService.createOrder(
        userId,
        businessId,
        terminalId,
        terminalSessionId,
        parsedValidatedData.items,
      );

      const response: ApiResponse<IPaymentIntentDTO> = {
        success: true,
        data: paymentToVerify,
        message: "Order processing",
      };

      res.status(201).json(response);
    } catch (error) {
      console.log("error", error);
      next(error);
    }
  };

  completeOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("req.user", req.user);

      const parsedValidatedPayment = PaymentValidationSchema.parse(req.body);

      const order = await this.orderService.completeOrder(
        parsedValidatedPayment,
      );

      const response: ApiResponse<OrderType> = {
        success: true,
        data: order,
        message: "Order completed successfully",
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return;
  };

  getOrderByBusiness = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    if (!req.user) {
      throw new UnauthorizedError("User not authorized");
    }

    const { businessId } = req.user;
    console.log("businessId", businessId);

    try {
      const orders = await this.orderService.getOrderByBusinessId(businessId);
      const response: ApiResponse<OrderType[]> = {
        success: true,
        data: orders,
      };
      res.status(200).json(response);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  update = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return;
  };

  remove = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return;
  };

  list = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return;
  };

  refundOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    return;
  };

  cancelOrder = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const { orderId } = req.body;
    await this.orderService.cancelOrder(orderId);
    const response: ApiResponse<OrderType> = {
      success: true,
      message: "Order cancelled succesfully",
    };

    res.status(200).json(response);
    return;
  };
}
