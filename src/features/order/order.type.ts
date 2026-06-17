import { OrderDocument, OrderType } from "./order.model";
import { RouteHandler } from "../../shared/baseType";
import { ICrudController } from "../../shared/crudControllerInterface";
import {
  FinalResolvedItem,
  RequestOrderItemType,
} from "./orderItems/orderItem.model";
import { ClientSession } from "mongoose";
import { PaymentInputType } from "../payment/payment.validation";

export interface IOrderController extends ICrudController {
  getOrderByBusiness: RouteHandler;
  completeOrder: RouteHandler;
  refundOrder: RouteHandler;
  cancelOrder: RouteHandler;
}

export interface IOrderService {
  createOrder(
    creatorId: string, //Order creater
    businessId: string,
    terminalId: string,
    terminalSessionId: string,
    cartItems: RequestOrderItemType[],
  ): Promise<any>;
  completeOrder(items: PaymentInputType): Promise<OrderType>;
  getOrder(orderId: string): Promise<void>; //need to change return type
  updateOrderStatus(orderId: string, status: string): Promise<void>;
  refundOrder(orderId: string): Promise<void>;
  cancelOrder(orderId: string): Promise<OrderType | null>;
  getOrderByBusinessId(businessId: string): Promise<OrderType[]>;
}

export interface IOrderRepository {
  createOrder(
    orderId: number,
    creatorId: string,
    businessId: string,
    terminalId: string,
    terminalSessionId: string,
    items: FinalResolvedItem[],
    total: number,
    session: ClientSession,
  ): Promise<OrderDocument>;
  orderById(id: string, session?: ClientSession): Promise<OrderDocument | null>;
  completeOrder(
    orderId: string,
    paidAmount: number,
    session?: ClientSession,
  ): Promise<OrderDocument | null>;
  deleteOrder(orderId: string): Promise<boolean>;
  cancelOrder(
    orderId: string,
    session: ClientSession,
  ): Promise<OrderType | null>;
  orderOfBusiness(businessId: string): Promise<OrderType[]>;
  // getOrder(orderId: string): Promise<OrderType>
  // updateOrderStatus(orderId: string, status: string): Promise<void>
  // refundOrder(orderId: string): Promise<void>
  // generateOrderNumber(): Promise<string>
}
