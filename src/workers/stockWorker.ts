import { ConnectionOptions, Job, Worker } from "bullmq";
import { IProductRepository } from "../features/products/product.type";
import { container } from "tsyringe";
import { TOKENS } from "../config/tokens";
import { IInventoryBatchRepository } from "../features/inventory/inventoryBatch.type";
import { redisConnect } from "../config/ioRedisConnection";
import { IUserBusinessRepository } from "../features/userBusiness/interfaces/userBusiness.interface";
import {
  INotificationRepository,
  INotificationService,
} from "../features/notification/notification.type";

const productRepository = container.resolve<IProductRepository>(
  TOKENS.PRODUCT_REPOSITORY,
);

const inventoryRepository = container.resolve<IInventoryBatchRepository>(
  TOKENS.INVENTORY_BATCH_REPOSITORY,
);

const userBusinessRepository = container.resolve<IUserBusinessRepository>(
  TOKENS.USER_BUSINESS_REPOSITORY,
);

const notificationService = container.resolve<INotificationService>(
  TOKENS.NOTIFICATION_SERVICE,
);

export const stockWorker = new Worker(
  "stockUpdates",
  async (job: Job) => {
    if (job.name === "low-stock") {
      const { orderItems, businessId } = job.data;

      const users = await userBusinessRepository.getBusinessUsers(businessId, [
        "manager",
        "owner",
      ]);

      try {
        for (const item of orderItems) {
          const product = await productRepository.findById(item.productId);
          console.log(product?.lowStock);

          if (product && product.lowStock) {
            const remainingStock = await inventoryRepository.getSumOfAllBatches(
              item.productId,
            );
            if (remainingStock < product.lowStock) {
              const emailPromises = users.map((user) =>
                notificationService.notifyStockLow(
                  user.email,
                  product.name,
                  product.sku,
                ),
              );

              await Promise.all(emailPromises);
            }
          }
        }
      } catch (err) {
        console.error("Error found", err);
        throw err;
      }
    }
  },
  { connection: redisConnect as ConnectionOptions },
);

stockWorker.on("completed", (job) => {
  console.log(`✨ Job ${job.id}  finished!`);
});

stockWorker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err.message);
});
