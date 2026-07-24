import { NextFunction, Request, Response } from "express";
import { IPaymentController } from "./payment.types";
import { injectable } from "tsyringe";
import { UnauthorizedError } from "../../errors/httpErrors";

@injectable()
export class PaymentController implements IPaymentController {
  transactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authenticated user not found");
      }

      if (!req.business) {
        throw new UnauthorizedError("Authenticated business not found");
      }

      const { userId } = req.user;
      const { businessId } = req.business;

      res.json({ user: userId, businessId: businessId });
    } catch (err) {
      next(err);
    }

    res.json({ message: "Payment" });
  };
}
