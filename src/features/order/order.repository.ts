import { injectable } from "tsyringe";
import { IOrderRepository } from "./order.type";
import { OrderDocument, OrderModel, OrderType } from "./order.model";

import { ClientSession } from "mongoose";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../../errors/httpErrors";
import { logger } from "../../middlewares/logHandler";
import { FinalResolvedItem } from "./orderItems/orderItem.model";

@injectable()
export class OrderRepository implements IOrderRepository {
  private order: typeof OrderModel;

  constructor() {
    this.order = OrderModel;
  }

  async createOrder(
    orderId: number,
    creatorId: string,
    businessId: string,
    terminalId: string,
    terminalSessionId: string,
    items: FinalResolvedItem[],
    total: number,
    session: ClientSession,
  ): Promise<OrderDocument> {
    try {
      const [order] = await this.order.create(
        [
          {
            orderId,
            creatorId,
            businessId,
            terminalId,
            terminalSessionId,
            items,
            total,
          },
        ],
        { session },
      );
      return order;
    } catch (err: any) {
      logger.error("Database error", err);
      throw new BadRequestError("Order cannot created", err.message);
    }
  }

  // Model.findById(id, projection, options)
  async orderById(
    orderId: string,
    session?: ClientSession,
  ): Promise<OrderDocument | null> {
    const order = await this.order.findById(orderId, null, { session });
    return order;
  }

  async completeOrder(
    orderId: string,
    paidAmount: number,
    session?: ClientSession,
  ): Promise<OrderDocument | null> {
    try {
      const updateOrder = await this.order.findOneAndUpdate(
        { _id: orderId, status: "pending" },
        {
          status: "completed",
          paidAmount,
          updatedAt: new Date(),
        },
        { new: true, session },
      );

      return updateOrder;
    } catch (error: any) {
      console.log(error);
      throw new Error("Database error", error);
    }
  }

  async deleteOrder(orderId: string): Promise<boolean> {
    const order = await this.order.findOneAndDelete({
      _id: orderId,
      status: "pending",
    });

    if (!order)
      throw new ConflictError("Order cannot be deleted", "Order Repository");
    return true;
  }

  async cancelOrder(
    orderId: string,
    session: ClientSession,
  ): Promise<OrderType | null> {
    const order = await this.order.findOneAndUpdate(
      { _id: orderId, status: "pending" },
      { status: "cancelled" },
      { new: true, runValidtors: true, session },
    );

    if (!order) {
      console.log(`⚠️ Order ${orderId} was not found or not in pending state.`);
      throw new NotFoundError("Order not found");
    }

    return order;
  }

  async orderOfBusiness(businessId: string): Promise<OrderType[]> {
    const order = await this.order.find({ businessId }).lean();
    return order;
  }
}
