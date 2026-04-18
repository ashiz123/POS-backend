import { container } from 'tsyringe'
import { TOKENS } from '../config/tokens'
import { comparePassword } from './password'
import { CryptoService, ICryptoService } from './token'
import {
    generateToken,
    signIn,
    signInForTerminal,
    SignInType,
} from './jwtService'
// import { GenerateActivationCode, generateActivationCode } from './token'

container.registerInstance(TOKENS.COMPARE_PASSWORD, comparePassword)
container.registerInstance<SignInType>(TOKENS.JWT_SIGN_IN, signIn)
container.registerInstance(TOKENS.JWT_TERMINAL_SIGN_IN, signInForTerminal)
container.registerInstance(TOKENS.GENERATE_TOKEN, generateToken)
container.registerSingleton<ICryptoService>(
    TOKENS.CRYPTO_SERVICE,
    CryptoService
)
