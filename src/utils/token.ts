import crypto from 'crypto'
import { singleton } from 'tsyringe'

// export type GenerateActivationCode = () => string

// export const createToken = () => {
//     const token = crypto.randomBytes(32).toString('hex')
//     return token
// }

// export const hashToken = (token: string) => {
//     const hashToken = crypto.createHash('sha256').update(token).digest('hex')
//     return hashToken
// }

// export const generateActivationCode: GenerateActivationCode = () => {
//     const code = crypto.randomInt(100000, 1000000)
//     return code.toString()
// }

export interface ICryptoService {
    createToken(): string
    hashToken(token: string): string
    generateActivationCode(): string
}

@singleton()
export class CryptoService implements ICryptoService {
    createToken(): string {
        return crypto.randomBytes(32).toString('hex')
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex')
    }

    generateActivationCode(): string {
        const code = crypto.randomInt(100000, 1000000)
        return code.toString()
    }
}
