import { injectable } from "tsyringe";
import { IOrderRepository, MaximumSold } from "./order.type";
import { OrderDocument, OrderModel, OrderType } from "./order.model";
import mongoose, { ClientSession, Mongoose, PipelineStage } from "mongoose";

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
    const order = await this.order
      .find({ businessId })
      .sort({ createdAt: -1 })
      .populate("terminalId", "name")
      .populate({
        path: "terminalSessionId",
        populate: {
          path: "assignId", // This is the field in your TerminalSession schema
          model: "User", // Explicitly target the 'User' collection/model
          select: "email", // Only select the field you want from the User collection
        },
      })
      .lean();
    return order;
  }

  async getSalesByInputDate(businessId: string, inputDate: Date) {
    // Create a date object for the beginning of today (00:00:00.000)

    console.log("businessId", businessId);
    const startDate = new Date(inputDate);
    startDate.setHours(0, 0, 0, 0);
    console.log("start date", startDate);

    const endDate = new Date(inputDate);
    endDate.setDate(startDate.getDate() + 1);
    console.log("end date", endDate);

    try {
      const pipeline = [
        {
          // 1. Filter by business and time (from start of today to now)
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          // 2. Sum the 'total' field
          $group: {
            _id: null,
            dailyTotal: { $sum: "$total" },
          },
        },
      ];

      const result = await this.order.aggregate(pipeline);
      console.log("result", result);

      return result.length > 0 ? result[0].dailyTotal : 0;
    } catch (error) {
      console.error("Error calculating daily sales:", error);
      throw error;
    }
  }

  async getBestSellingItem(businessId: string): Promise<MaximumSold> {
    try {
      //validate Id before query
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new Error("Invalid Business ID format.");
      }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            businessId: new mongoose.Types.ObjectId(businessId),
          },
        },
        {
          $unwind: "$items",
        },
        {
          $group: {
            _id: "$items.productId",
            totalSold: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },

        //sort and limit before project
        { $sort: { totalSold: -1 } },
        { $limit: 1 },

        {
          $lookup: {
            from: "products",
            localField: "_id", //matches _id from the group stage (productId)
            foreignField: "_id", // matches _id in the products collection
            as: "productDetails",
          },
        },

        //Finally project
        {
          $project: {
            _id: 0,
            productId: "$_id",
            productInfo: { $arrayElemAt: ["$productDetails", 0] }, //ProductDetails response as array, get the first element and get the name
            totalSold: 1,
            totalRevenue: 1,
          },
        },

        {
          $project: {
            productId: 1,
            totalSold: 1,
            totalRevenue: 1,
            productName: "$productInfo.name",
          },
        },
      ];

      const result = await this.order.aggregate<MaximumSold>(pipeline).exec();

      if (!result || result.length === 0) {
        throw new Error("No products found for this business.");
      }

      return result[0];
    } catch (error) {
      console.error("Error calculating daily sales:", error);
      throw error;
    }
  }

  async getCancelledOrder(businessId: string): Promise<OrderType[]> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      return await this.order
        .find({
          businessId: new mongoose.Types.ObjectId(businessId),
          status: "cancelled",
          createdAt: {
            $gte: today,
            $lt: tomorrow,
          },
        })
        .exec();
    } catch (error) {
      console.error("Error to retrieve cancelled error", error);
      throw error;
    }
  }

  async getTodaysTransactions(
    businessId: string,
    limit?: number,
  ): Promise<OrderType[]> {
    try {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // 1. Start the query
      let query = this.order.find({
        businessId: new mongoose.Types.ObjectId(businessId),
        createdAt: { $gte: today },
      });

      // If limit is provided, we sort by newest and apply the limit
      if (limit && limit > 0) {
        query = query.sort({ createdAt: -1 }).limit(limit);
      }

      // 3. Populate and execute
      return await query.populate("terminalId", "name").exec();
    } catch (error) {
      console.error("Error retrieving today's transactions:", error);
      throw error;
    }
  }
}
