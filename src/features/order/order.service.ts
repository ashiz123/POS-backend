import { inject, injectable } from "tsyringe";
import { IOrderRepository, IOrderService } from "./order.type";
import { OrderDocument, OrderType } from "./order.model";
import { TOKENS } from "../../config/tokens";
import { ICounterRepository } from "../counter/counter.repository";
import {
  BatchAllocationType,
  FinalResolvedItem,
  RequestOrderItemType,
} from "./orderItems/orderItem.model";
import { IInventoryBatchRepository } from "../inventory/inventoryBatch.type";
import { PaymentInputType } from "../payment/payment.validation";
import { IPaymentService } from "../payment/payment.types";
import mongoose, { ClientSession } from "mongoose";
import { BadRequestError, NotFoundError } from "../../errors/httpErrors";
import { orderQueue } from "../../queues/orderQueue";
import {
  IStripePaymentService,
  StripePaymentData,
} from "../stripe/stripePayment.type";
import { PaymentType } from "../payment/payment.model";
import { PAYMENT_STATUS, PAYMENT_TYPE } from "../payment/payment.constants";
import { stockQueue } from "../../queues/stockQueue";

@injectable()
export class OrderService implements IOrderService {
  constructor(
    @inject(TOKENS.ORDER_REPOSITORY)
    private orderRepository: IOrderRepository,

    @inject(TOKENS.COUNTER_REPOSITORY)
    private counterRepository: ICounterRepository,

    @inject(TOKENS.INVENTORY_BATCH_REPOSITORY)
    private inventoryRepository: IInventoryBatchRepository,

    @inject(TOKENS.PAYMENT_SERVICE)
    private paymentService: IPaymentService,

    @inject(TOKENS.STRIPE_PAYMENT_SERVICE)
    private stripeService: IStripePaymentService,
  ) {}

  async createOrder(
    creatorId: string,
    businessId: string,
    terminalId: string,
    terminalSessionId: string,
    cartItems: RequestOrderItemType[],
  ): Promise<any> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const resolvedItems: FinalResolvedItem[] = [];
      const orderId = await this.counterRepository.getNextSequence("order");
      const VAT_RATE = 0.13;

      const total = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      const totalWithVat = Number(total + total * VAT_RATE);

      for (const item of cartItems) {
        const batchAllocations = await this.resolvedBatches(
          item.productId,
          item.quantity,
          session,
        );

        for (const batch of batchAllocations) {
          await this.inventoryRepository.deductBatchStock(
            batch.batchId,
            batch.quantity,
            session,
          );
        }

        resolvedItems.push({
          productId: item.productId,
          sku: item.sku,
          price: item.price,
          quantity: item.quantity, // The total amount the user bought
          allocations: batchAllocations, // <-- The nested FEFO math goes right here!
        });
      }

      const newOrder = await this.orderRepository.createOrder(
        orderId,
        creatorId,
        businessId,
        terminalId,
        terminalSessionId,
        resolvedItems,
        totalWithVat,
        session,
      );

      await session.commitTransaction();

      const totalInPence = Math.round(totalWithVat * 100);

      const stripeData: StripePaymentData = {
        amount: totalInPence,
        currency: "gbp",
        orderId: newOrder.id,
        businessId,
      };
      const paymentDetail =
        await this.stripeService.createPaymentIntent(stripeData);

      //calling the queue and adding the job
      await orderQueue.add(
        "auto-cancel",
        { orderId: newOrder._id },
        {
          delay: 1 * 60 * 1000,
          attempts: 3,
          removeOnComplete: true,
        },
      );

      return paymentDetail;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  //this function is helper function for createOrder function
  async resolvedBatches(
    productId: string,
    qtyRequired: number,
    session: ClientSession,
  ): Promise<BatchAllocationType[]> {
    const resolved: BatchAllocationType[] = []; //to store the resolved
    const batches =
      await this.inventoryRepository.getEarliestExpiryBatchesFirst(
        productId,
        session,
      );

    let remaining = qtyRequired;

    for (const batch of batches) {
      if (remaining <= 0) break;
      const take: number = Math.min(batch.quantity, remaining); //taking into array,
      resolved.push({
        batchId: batch._id,
        quantity: take,
      });
      remaining -= take;
    }

    if (remaining > 0)
      throw new Error(`Insufficient stock for product ${productId}`);

    return resolved;
  }

  async completeOrder(data: PaymentInputType): Promise<OrderType> {
    const session = await mongoose.startSession();

    const { stripePaymentId, orderId } = data;

    try {
      session.startTransaction();
      const order = await this.orderRepository.orderById(orderId, session);

      if (!order) {
        throw new NotFoundError("order not created ");
      }

      const paymentData =
        await this.stripeService.retrievePaymentData(stripePaymentId);

      const updateOrder = await this.orderRepository.completeOrder(
        orderId,
        paymentData.amount,
        session,
      );

      let paidBy;

      if (paymentData.paymentType === "card_present") {
        paidBy = PAYMENT_TYPE.CARD;
      }

      if (!updateOrder) throw new Error("Order not found");

      const paymentDataMap: PaymentType = {
        orderId: data.orderId,
        stripePaymentId: data.stripePaymentId,
        type: paidBy,
        status: PAYMENT_STATUS.COMPLETED,
        amount: paymentData.amount,
        currency: paymentData.currency,
      };

      await this.paymentService.createPayment(paymentDataMap, session);

      await session.commitTransaction();

      //TODO: Write the condition to test payment succedded
      // Notify to owner for low stock

      //Check the low stock
      await stockQueue.add(
        "low-stock",
        { orderItems: order.items, businessId: order.businessId },
        {
          delay: 1 * 30 * 1000,
          attempts: 3,
          removeOnComplete: true,
        },
      );

      return updateOrder;
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getOrder(orderId: string): Promise<void> {
    return;
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    return;
  }

  async refundOrder(orderId: string): Promise<void> {
    return;
  }

  async cancelOrder(orderId: string): Promise<OrderType | null> {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order: OrderDocument | null =
        await this.orderRepository.orderById(orderId);

      if (!order) throw new NotFoundError("Order not found");

      if (order.status !== "pending") {
        throw new Error(
          `Cannot cancel order. Current status is ${order.status}`,
        );
      }

      for (const item of order.items) {
        for (const allocation of item.allocations) {
          await this.inventoryRepository.restoreBatchBack(
            allocation.batchId,
            allocation.quantity,
            session,
          );
        }
      }

      const cancelledOrder = await this.orderRepository.cancelOrder(
        orderId,
        session,
      );
      await session.commitTransaction();

      return cancelledOrder;
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  }

  async getOrderByBusinessId(businessId: string): Promise<OrderType[]> {
    if (!businessId) {
      throw new BadRequestError("BusinessId is required");
    }
    const orders = this.orderRepository.orderOfBusiness(businessId);
    return orders;
  }
}
