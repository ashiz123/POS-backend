import { container } from "tsyringe";
import {
  ITerminalController,
  ITerminalRepository,
  ITerminalService,
} from "./terminal.interface";
import { TerminalRepository } from "./terminal.respository";
import { TOKENS } from "../../config/tokens";
import { TerminalService } from "./terminal.service";
import { TerminalController } from "./terminal.controller";

container.registerSingleton<ITerminalRepository>(
  TOKENS.TERMINAL_REPOSITORY,
  TerminalRepository,
);

container.registerSingleton<ITerminalService>(
  TOKENS.TERMINAL_SERVICE,
  TerminalService,
);

container.registerSingleton<ITerminalController>(
  TOKENS.TERMINAL_CONTROLLER,
  TerminalController,
);
