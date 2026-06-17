import { injectable } from "tsyringe";
import {
  FinalResolvedItem,
  OrderItemDocument,
  OrderItemModel,
} from "./orderItem.model";
import { IOrderItemRepository } from "./orderItem.type";

@injectable()
export class OrderItemRepository implements IOrderItemRepository {
  private orderItemModel: typeof OrderItemModel;

  constructor() {
    this.orderItemModel = OrderItemModel;
  }

  async createOrderItem(data: FinalResolvedItem): Promise<OrderItemDocument> {
    const orderItem = await this.orderItemModel.create(data);
    return orderItem;
  }

  async refundOrderItem(orderItem: string): Promise<boolean> {
    return true;
  }
}
