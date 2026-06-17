import { Worker, Job, ConnectionOptions } from "bullmq";
import { container } from "tsyringe";
import { IOrderRepository, IOrderService } from "../features/order/order.type";
import { TOKENS } from "../config/tokens";
import { NotFoundError } from "../errors/httpErrors";
import { redisConnect } from "../config/ioRedisConnection";

const orderRepository = container.resolve<IOrderRepository>(
  TOKENS.ORDER_REPOSITORY,
);

const orderService = container.resolve<IOrderService>(TOKENS.ORDER_SERVICE);

export const autoCancelWoker = new Worker(
  "order",
  async (job: Job) => {
    if (job.name === "auto-cancel") {
      const { orderId } = job.data;

      try {
        const order = await orderRepository.orderById(orderId);

        if (!order) {
          throw new NotFoundError("Order does not exist");
        }

        if (order.status === "pending") {
          await orderService.cancelOrder(orderId);
          console.log(
            `Order ${orderId} was pending and has been auto cancelled`,
          );
        } else {
          console.log(
            `Order ${orderId} is safe either cancelled or success. So status not changed`,
          );
        }

        console.log("order automatically cancelled after 5 minutes");
      } catch (err) {
        console.error("Error found", err);
        throw err;
      }
    }
  },
  { connection: redisConnect as ConnectionOptions },
);

autoCancelWoker.on("completed", (job) => {
  console.log(`✨ Job ${job.id} for order ${job.data.orderId} finished!`);
});

autoCancelWoker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err.message);
});
