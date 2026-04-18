import { SignJWT, jwtVerify } from 'jose'
import { redisConnect } from '../config/ioRedisConnection.js'
import {
    Payload,
    JwtPayload,
} from '../features/auth/interfaces/authInterface.js'
import { PreAuthType } from '../features/auth/types/LoginResponse.type.js'
import { container } from 'tsyringe'
import { ISessionService } from '../features/session/session.type.js'
import { TOKENS } from '../config/tokens.js'
import { ConflictError } from '../errors/httpErrors.js'
import { AUTH_TYPE, USER_ROLE } from '../features/auth/user.constant.js'

const secret = new TextEncoder().encode(process.env.JWT_SECRET)

if (!secret) {
    throw new Error('JWT secret is not set')
}

// export interface IClaims extends Omit<JWTPayload, 'sub'> {
//     sub: string
//     email: string
// }

export const ISSUER: string = 'my-pos-auth'
export const AUDIENCE: string = 'my-pos-api'

export type SignInType = (
    data: Payload | PreAuthType,
    ttl?: string
) => Promise<string>

export type GenerateTokenType = (payload: any) => Promise<string>

export const signIn: SignInType = async (data, ttl = '10m') => {
    return await new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .setExpirationTime(ttl)
        .sign(secret)
}

export const signInForTerminal: SignInType = async (data) => {
    return await new SignJWT(data)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setAudience(AUDIENCE)
        .sign(secret)
}

export async function generateTokenForTerminal(payload: any) {
    const token = await signInForTerminal(payload)
    return token
}

export const generateToken: GenerateTokenType = async (payload: Payload) => {
    const token = await signInForTerminal(payload)
    return token
}

export async function verifyToken(token: string): Promise<JwtPayload> {
    const { payload } = await jwtVerify<JwtPayload>(token, secret, {
        algorithms: ['HS256'],
        issuer: ISSUER,
        audience: AUDIENCE,
        clockTolerance: 5,
    })

    if (!payload.type) {
        throw new ConflictError('Payload type not found')
    }

    //holding the session in redis
    if (
        payload.role !== USER_ROLE.ADMIN &&
        [AUTH_TYPE.APP_ACCESS, AUTH_TYPE.TERMINAL_ACCESS].includes(payload.type)
    ) {
        const sessionService = container.resolve<ISessionService>(
            TOKENS.SESSION_SERVICE
        )
        const session = await sessionService.getSession(token)
        console.log('4. Redis Result:', session)

        if (!session) {
            throw new Error('Token is invalid or has expired')
        }
    }

    return payload
}
