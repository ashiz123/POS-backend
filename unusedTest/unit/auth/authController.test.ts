import { vi, expect, it, describe } from 'vitest'
import {
    registerUser,
    loginUser,
    logoutUser,
} from '../../../src/features/auth/auth.controller.js'
import type {
    IAuthService,
    IUserProps,
} from '../../../src/features/auth/interfaces/authInterface.js'
import type { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import {
    LoginResponse,
    LoginWithSelectBusinessDTO,
} from '../../../src/features/auth/types/LoginResponse.type.js'

const mockUser: IUserProps = {
    name: 'Ram Doe',
    email: 'john@gmail.com',
    phone: '1234567890',
    password: 'hashedpassword',
    status: 'pending',
    role: 'owner',
    createdBy: 'new-object-id',
}

const mockLoginResponse: LoginResponse = {
    email: 'test@gmail.com',
    token: 'fake-jwt-token',
}

const mockLoginResponseWithBusiness: LoginWithSelectBusinessDTO = {
    email: 'test@gmail.com',
    userId: 'new-object-id',
    type: 'owner',
    businessId: 'new-object-id',
}

const mockAuthService: IAuthService = {
    register: vi.fn().mockResolvedValue(mockUser),
    login: vi.fn().mockResolvedValue(mockLoginResponse),
    logout: vi.fn().mockResolvedValue(true),
    loginWithSelectBusiness: vi
        .fn()
        .mockResolvedValue(mockLoginResponseWithBusiness),
}

describe('registerUser controller', () => {
    it('should register a new user and return user data', async () => {
        const req = {
            body: {
                name: 'John Doe',
                email: 'john@gmail.com',
                phone: '1234567890',
                password: 'password123',
            },
        } as unknown as Request

        const mockJson = vi.fn()
        const res = {
            status: vi.fn(() => ({ json: mockJson })),
        } as unknown as Response

        const next = vi.fn() as unknown as NextFunction

        const handler = registerUser(mockAuthService)
        await handler(req, res, next)

        expect(mockAuthService.register).toHaveBeenCalledWith({
            email: 'john@gmail.com',
            name: 'John Doe',
            password: 'password123',
            phone: '1234567890',
            role: 'cashier',
        })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(mockJson).toHaveBeenCalledWith(mockUser)
    })

    it('should failed the validation and call next with error', async () => {
        const req = {
            body: {
                name: 'John Doe',
                email: 'invalid-email',
                phone: '1234567890',
                password: 'password123',
            },
        } as unknown as Request

        const res = {} as unknown as Response
        const next = vi.fn() as unknown as NextFunction

        const handler = registerUser(mockAuthService)
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
        // expect(next.mock.calls[0][0]).toBeInstanceOf(Error)
        expect(next).toHaveBeenCalledWith(expect.any(ZodError))
    })
})

describe('login controller', () => {
    it('should login a user and return login response', async () => {
        const req = {
            body: {
                email: 'john@gmail.com',
                password: 'password123',
            },
        } as unknown as Request

        const mockJson = vi.fn()
        const res = {
            status: vi.fn(() => ({ json: mockJson })),
        } as unknown as Response

        const next = vi.fn() as unknown as NextFunction

        const handler = loginUser(mockAuthService)
        await handler(req, res, next)

        expect(mockAuthService.login).toHaveBeenCalledWith(
            'john@gmail.com',
            'password123'
        )
        expect(res.status).toHaveBeenCalledWith(200)
        expect(mockJson).toHaveBeenCalled()
        expect(mockJson).toHaveBeenCalledWith({
            success: true,
            message: 'User logged in successfully',
            data: mockLoginResponse,
        })
    })

    it('should failed the validation and call next with error', async () => {
        const req = {
            body: {
                email: 'invalid-email',
                password: 'password123',
            },
        } as unknown as Request

        const res = {} as unknown as Response
        const next = vi.fn() as unknown as NextFunction

        const handler = loginUser(mockAuthService)
        await handler(req, res, next)
        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(expect.any(ZodError))
    })
})

describe('logoutUser controller', () => {
    it('should logut a user successfully', async () => {
        const req = {
            headers: {
                authorization: 'Bearer fake-jwt-token',
            },
        } as unknown as Request

        const mockJson = vi.fn()
        const res = {
            status: vi.fn(() => ({ json: mockJson })),
        } as unknown as Response

        const next = vi.fn() as unknown as NextFunction

        const handler = logoutUser(mockAuthService)
        await handler(req, res, next)

        expect(mockAuthService.logout).toHaveBeenCalledWith('fake-jwt-token')
        expect(res.status).toHaveBeenCalledWith(200)
        expect(mockJson).toHaveBeenCalledWith({
            message: 'User logged out successfully',
        })
    })

    it('should call next with error if logout fails', async () => {
        const req = {
            headers: {
                authorization: 'Bearer fake-jwt-token',
            },
        } as unknown as Request

        const res = {} as unknown as Response
        const next = vi.fn() as unknown as NextFunction

        mockAuthService.logout = vi
            .spyOn(mockAuthService, 'logout')
            .mockResolvedValueOnce(false)

        // mockAuthService.logout = vi.fn().mockResolvedValueOnce(false)

        const handler = logoutUser(mockAuthService)
        await handler(req, res, next)

        expect(next).toHaveBeenCalledWith(expect.any(Error))
    })
})
