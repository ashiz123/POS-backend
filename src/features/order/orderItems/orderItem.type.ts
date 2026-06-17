import { FinalResolvedItem, OrderItemDocument } from "./orderItem.model";

export interface IOrderItemRepository {
  createOrderItem(data: FinalResolvedItem): Promise<OrderItemDocument>;
  refundOrderItem(orderItemId: string): Promise<boolean>;
}
