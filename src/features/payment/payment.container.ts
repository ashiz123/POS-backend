import { container } from "tsyringe";
import { TOKENS } from "../../config/tokens";
import {
  IPaymentController,
  IPaymentRepository,
  IPaymentService,
} from "./payment.types";
import { PaymentRepository } from "./payment.repository";
import { PaymentService } from "./payment.service";
import { PaymentController } from "./payment.controller";

container.registerSingleton<IPaymentRepository>(
  TOKENS.PAYMENT_REPOSITORY,
  PaymentRepository,
);
container.registerSingleton<IPaymentService>(
  TOKENS.PAYMENT_SERVICE,
  PaymentService,
);

container.registerSingleton<IPaymentController>(
  TOKENS.PAYMENT_CONTROLLER,
  PaymentController,
);
