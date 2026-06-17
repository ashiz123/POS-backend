import { container } from "tsyringe";
import { TOKENS } from "../config/tokens";
import { comparePassword } from "./password";
import { CryptoService, ICryptoService } from "./token";
import {
  // generateToken,
  signIn,
  // signInForTerminal,
  SignInType,
  verifyToken,
  VerifyType,
} from "./jwtService";

container.registerInstance(TOKENS.COMPARE_PASSWORD, comparePassword);
container.registerInstance<SignInType>(TOKENS.JWT_SIGN_IN, signIn);
container.registerInstance<VerifyType>(TOKENS.VERIFY_JWT, verifyToken);
container.registerSingleton<ICryptoService>(
  TOKENS.CRYPTO_SERVICE,
  CryptoService,
);
