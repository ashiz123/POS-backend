import { Request, Response, NextFunction } from "express";
import { IDashboardController, IDashboardService } from "./dashboard.types";
import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { UnauthorizedError } from "../../errors/httpErrors";


@injectable()
export class DashboardController implements IDashboardController {
  constructor(
    @inject(TOKENS.DASHBOARD_SERVICE)
    private dashboardService: IDashboardService,
  ) {}

  totalNetSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authorised user not found");
      }

      const { businessId } = req.user;
      if (!businessId) {
        throw new UnauthorizedError("Unauthorized business");
      }
      const totalSales =
        await this.dashboardService.totalSalesToday(businessId);

      res.status(200).json(totalSales);
    } catch (err: any) {
      console.log(err);
      next(err);
    }
  };

  bestSellingItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authorised user not found");
      }

      const { businessId } = req.user;
      if (!businessId) {
        throw new UnauthorizedError("Unauthorized business");
      }
      const bestSellingItem =
        await this.dashboardService.bestSellingItem(businessId);

      res.status(200).json(bestSellingItem);
    } catch (err: any) {
      console.log(err);
      next(err);
    }
  };

  transactionToday = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    res.json({ count: 10 });
  };
  //Refund activity
  // orderId, orderDate, amount, terminalId,
  refundOrder = async (req: Request, res: Response, next: NextFunction) => {
    res.json({ refunds: 0 });
  };

  voidOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const businessId = req.user?.businessId;
      if (!businessId) {
        throw new UnauthorizedError("Unauthorized business");
      }

      const voidOrdered = await this.dashboardService.voidOrder(businessId);
      if (voidOrdered.length === 0) {
        res.status(404).json({
          success: false,
          message: "No cancelled orders found for this business.",
        });
        return;
      }

      res.status(200).json(voidOrdered);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  };

  lowStockProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {

      const businessId = req.user?.businessId;
      if (!businessId) {
        throw new UnauthorizedError("Unauthorized business");
      }

      const products = await this.dashboardService.lowStockProducts(businessId)
      res.status(200).json(products);
      return;
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
