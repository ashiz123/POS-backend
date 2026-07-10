import { container } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import { DashboardController } from "./dashboard.controller";
import { IDashboardController, IDashboardService } from "./dashboard.types";
import { DashboardService } from "./dashboard.service";

container.registerSingleton<IDashboardController>(
  TOKENS.DASHBOARD_CONTROLLER,
  DashboardController,
);

container.registerSingleton<IDashboardService>(
  TOKENS.DASHBOARD_SERVICE,
  DashboardService,
);
