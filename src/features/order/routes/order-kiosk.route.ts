import { container } from "tsyringe";
import { createCrudRoutes } from "../../../shared/baseRouter";
import { IOrderController } from "../order.type";
import { TOKENS } from "../../../config/tokens";
import { requireDevice } from "../../../middlewares/requireDevice";
import { kioskAuthHandler } from "../../../middlewares/kioskAuthHanlder";

export const orderController = container.resolve<IOrderController>(
  TOKENS.ORDER_CONTROLLER,
);

export default createCrudRoutes(orderController, {
  exclude: ["list", "show", "update", "remove"],
  middleware: [requireDevice, kioskAuthHandler],
  additionalRoute: [
    {
      name: "complete_order",
      method: "post",
      path: "/complete_order",
      handler: orderController.completeOrder,
    },
  ],
});
