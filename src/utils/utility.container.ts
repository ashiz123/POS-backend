import { container } from "tsyringe";
import { TOKENS } from "../config/tokens";
import { comparePassword } from "./password";
import { CryptoService, ICryptoService } from "./token";

container.registerInstance(TOKENS.COMPARE_PASSWORD, comparePassword);

container.registerSingleton<ICryptoService>(
  TOKENS.CRYPTO_SERVICE,
  CryptoService,
);
