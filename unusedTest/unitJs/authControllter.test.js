import { createMockAuthService } from '../../dist/features/auth/__mocks__/auth.service.js'
import {
    registerUser,
    loginUser,
    getAuthUser,
    logoutUser,
} from '../../dist/features/auth/auth.controller.js'
import { jest } from '@jest/globals'

let mockAuthService

beforeAll(() => {
    jest.clearAllMocks()
    mockAuthService = createMockAuthService(jest)
})

afterAll(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
})

describe('registeration user test', () => {
    let req
    let res
    let next
    beforeEach(() => {
        req = {
            body: {
                name: 'Test User',
                email: 'test@example.com',
                phone: '1234567890',
                password: 'password123',
            },
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    it('should register user successfully', async () => {
        const handler = registerUser(mockAuthService)
        await handler(req, res, next)

        //we need to test the service doing mocking, because if service is right then controller will be right.
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            name: 'Mock User',
            email: 'mock@example.com',
            phone: '1234567890',
            password: 'password123',
        })

        // Ensure the mock register method was called with correct parameters

        expect(mockAuthService.register).toHaveBeenCalledWith(
            'Test User',
            'test@example.com',
            '1234567890',
            'password123'
        )

        // Ensure next was not called since there was no error

        expect(next).not.toHaveBeenCalled()
    })
})

describe('AuthService.login', () => {
    let req
    let res
    let next

    beforeEach(() => {
        mockAuthService = createMockAuthService(jest)
        req = {
            body: {
                email: 'test@example.com',
                password: 'password123',
            },
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()
    })

    it('should login user successfully', async () => {
        const handler = loginUser(mockAuthService)
        await handler(req, res, next)

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            result: {
                token: 'mocked-jwt-token',
            },
        })
    })
})

describe('get logged in user', () => {
    let req
    let res
    let next

    beforeEach(() => {
        mockAuthService = createMockAuthService(jest)
        ;((req = {
            user: {
                id: 'user123',
                name: 'Test User',
                email: 'test@gmail.com',
            },
        }),
            (res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            }))
    })

    it('should return logged in user ', async () => {
        const handler = getAuthUser()
        await handler(req, res, next)
        expect(res.status).toHaveBeenCalledWith(200)

        expect(res.json).toHaveBeenCalledWith({
            loggedInUser: {
                email: 'test@gmail.com',
                id: 'user123',
                name: 'Test User',
            },
        })
    })
})

describe('logout user', () => {
    let req
    let res
    let next

    beforeEach(() => {
        mockAuthService = createMockAuthService(jest)
        req = {
            headers: {
                authorization: 'Bearer fake-jwt-token',
            },
        }
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        }
        next = jest.fn()

        mockAuthService.logout.mockResolvedValue(true)
    })

    it('should logout user successfully', async () => {
        const handler = logoutUser(mockAuthService)
        await handler(req, res, next)
        expect(mockAuthService.logout).toHaveBeenCalledWith('fake-jwt-token')
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            message: 'User logged out successfully',
        })
    })
})
