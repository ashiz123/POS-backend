import { container } from "tsyringe";
import { IMenuController } from "./kiosk.type";
import { TOKENS } from "../../config/tokens";
import { MenuController } from "./menu.controller";

container.registerSingleton<IMenuController>(
  TOKENS.MENU_CONTROLLER,
  MenuController,
);
