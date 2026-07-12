import { inject, injectable } from "tsyringe";
import { TOKENS } from "../../config/tokens";

import { IOrderRepository, MaximumSold } from "../order/order.type";
import { IDashboardService } from "./dashboard.types";
import { OrderType } from "../order/order.model";
import { IProduct } from "../products/product.model";
import { IProductRepository } from "../products/product.type";

@injectable()
export class DashboardService implements IDashboardService {
  constructor(
    @inject(TOKENS.ORDER_REPOSITORY) private orderRepository: IOrderRepository,
    @inject(TOKENS.PRODUCT_REPOSITORY)
    private productRepository: IProductRepository,
  ) {}

  async totalSalesToday(businessId: string): Promise<number> {
    const totalSalesByToday = this.orderRepository.getSalesByInputDate(
      businessId,
      new Date(),
    );
    return totalSalesByToday;
  }

  async bestSellingItem(businessId: string): Promise<MaximumSold> {
    return this.orderRepository.getBestSellingItem(businessId);
  }

  async voidOrder(businessId: string): Promise<OrderType[]> {
    return this.orderRepository.getCancelledOrder(businessId);
  }

  async lowStockProducts(businessId: string): Promise<IProduct[]> {
    return this.productRepository.getProductWithLowStock(businessId);
  }

  async todayOrders(businessId: string): Promise<OrderType[]> {
    return this.orderRepository.getTodaysTransactions(businessId, 10);
  }
}
