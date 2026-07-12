import { RouteHandler } from "../../shared/baseType";
import { OrderType } from "../order/order.model";
import { MaximumSold } from "../order/order.type";
import { IProduct } from "../products/product.model";

export interface IDashboardController {
  totalNetSales: RouteHandler;
  transactionToday: RouteHandler;
  refundOrder: RouteHandler;
  voidOrder: RouteHandler;
  bestSellingItem: RouteHandler;
  lowStockProducts: RouteHandler;
}

export interface IDashboardService {
  totalSalesToday(businessId: string): Promise<number>;
  bestSellingItem(businessId: string): Promise<MaximumSold>;
  voidOrder(businessId: string): Promise<OrderType[]>;
  lowStockProducts(businessId: string): Promise<IProduct[]>;
  todayOrders(businessId: string): Promise<OrderType[]>;
}
