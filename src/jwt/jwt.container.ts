import { container } from "tsyringe";
import { TOKENS } from "../config/tokens";

import {
  // generateToken,
  signIn,
  // signInForTerminal,
  SignInType,
  verifyToken,
  VerifyType,
} from "../jwt/jwtService";

container.registerInstance<SignInType>(TOKENS.JWT_SIGN_IN, signIn);
container.registerInstance<VerifyType>(TOKENS.VERIFY_JWT, verifyToken);
