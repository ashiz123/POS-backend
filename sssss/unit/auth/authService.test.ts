import {
    MockedFunction,
    vi,
    type Mocked,
    describe,
    it,
    beforeEach,
    expect,
} from 'vitest'
import { AuthService } from '../../../src/features/auth/auth.service'
import { ComparePasswordFn } from '../../../src/utils/password'
import { signIn } from '../../../src/utils/jwtService'

import {
    IAuthRepository,
    IAuthService,
    IUserDocument,
    IUserProps,
} from '../../../src/features/auth/interfaces/authInterface'
import {
    ConflictError,
    NotFoundError,
    UnauthorizedError,
} from '../../../src/errors/httpErrors'
import bcrypt from 'bcryptjs'
import { RedisClientType } from 'redis'
import { Types } from 'mongoose'

// Your mock must look like this:
vi.mock('../../../src/utils/jwtService')

let authService: IAuthService
let mockAuthRepository: Mocked<IAuthRepository>
let mockComparePassword: MockedFunction<ComparePasswordFn>
let mockRedisClient: Mocked<RedisClientType>

beforeEach(() => {
    vi.clearAllMocks()
    mockAuthRepository = {
        findByEmail: vi.fn(),
        createUser: vi.fn(),
    }

    mockComparePassword = vi.fn<ComparePasswordFn>().mockResolvedValue(true)
    mockRedisClient = {
        get: vi.fn(),
        set: vi.fn(),
        del: vi.fn(),
    } as unknown as Mocked<RedisClientType>

    authService = new AuthService(
        mockAuthRepository,
        mockComparePassword,
        mockRedisClient
    )
})

describe('Register service', () => {
    const newUser: IUserProps = {
        name: 'Ram Doe',
        email: 'john@gmail.com',
        phone: '1234567890',
        password: 'hashedpassword',
        status: 'pending',
    }

    it('should create new user successfully', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(null)
        mockAuthRepository.createUser.mockResolvedValue(
            newUser as IUserDocument
        )
        const result = await authService.register(newUser)

        // Assert
        expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith(
            'john@gmail.com'
        )
        expect(result).toEqual(newUser)
    })

    it('should throw the conflict error, user already exist', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(
            newUser as IUserDocument
        )
        const result = authService.register(newUser)
        await expect(result).rejects.toBeInstanceOf(ConflictError)
        expect(mockAuthRepository.createUser).not.toHaveBeenCalled()
    })
})

describe('login service', () => {
    let mockLoggedInUser: Partial<IUserProps>

    beforeEach(async () => {
        mockLoggedInUser = {
            name: 'Ram Doe',
            email: 'john@gmail.com',
            phone: '2345678909',
            password: await bcrypt.hash('hashedpassword', 10),
        }
    })

    it('should throw user not registered error', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(null)
        const result = authService.login('test@gmail.com', 'password123')
        await expect(result).rejects.toThrow('User not registered')
        await expect(result).rejects.toBeInstanceOf(NotFoundError)
    })

    it('should throw unauthorized error if password does not match', async () => {
        mockAuthRepository.findByEmail.mockResolvedValue(
            mockLoggedInUser as IUserDocument
        )
        mockComparePassword.mockResolvedValue(false)
        const result = authService.login('john@gmail.com', 'wrongpassword')
        await expect(result).rejects.toBeInstanceOf(UnauthorizedError)
    })

    it('should return login response and store session in Redis on success', async () => {
        // Setup
        const mockUser = {
            _id: new Types.ObjectId('6961460e3d8efef86d62df90'),
            email: 'test@example.com',
            password: 'hashedPassword',
        }

        const mockSignIn: MockedFunction<typeof signIn> = vi.mocked(signIn)
        const mockToken: string = 'fake-jwt-token-created'

        mockAuthRepository.findByEmail.mockResolvedValue(
            mockUser as IUserDocument
        ) //there is user
        mockComparePassword.mockResolvedValue(true) //password matched
        mockSignIn.mockResolvedValue(mockToken) //token received
        // mockRedisClient.get.mockResolvedValue('6961460e3d8efef86d62df90') //mock that you got data in redis.

        // Execute
        const result = await authService.login(
            'test@example.com',
            'hashedPassword'
        )

        // Assertions
        expect(result).toEqual({
            id: mockUser._id,
            email: mockUser.email,
            token: mockToken,
        })

        // Verify Redis interaction
        expect(mockRedisClient.set).toHaveBeenCalledWith(
            `session:${mockToken}`,
            '{"sub":"6961460e3d8efef86d62df90","email":"test@example.com"}',
            { EX: 3600 }
        )
    })
})

describe('logout user', async () => {
    it('should return true', async () => {
        const token = 'fake-token'
        mockRedisClient.del.mockResolvedValue(1)
        const result = await authService.logout(token)
        expect(result).toBe(true)
    })
})
