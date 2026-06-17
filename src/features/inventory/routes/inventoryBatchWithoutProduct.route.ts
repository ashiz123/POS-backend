import { container } from "tsyringe";
import { authWithBusinessHandler } from "../../../middlewares/authWithBusinessHandler";
import { hasPermission } from "../../../middlewares/hasPermission";
import { createCrudRoutes } from "../../../shared/baseRouter";
import { IInventoryBatchController } from "../inventoryBatch.type";
import { TOKENS } from "../../../config/tokens";

export const inventoryBatchController =
  container.resolve<IInventoryBatchController>(
    TOKENS.INVENTORY_BATCH_CONTROLLER,
  );

export default createCrudRoutes(inventoryBatchController, {
  exclude: ["create", "all"],
  middleware: [authWithBusinessHandler, hasPermission("handle_product")],
});
