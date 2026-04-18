import { AuthService } from '../../dist/features/auth/auth.service.js'

import { signIn } from '../../dist/config/jwtService'
import { redisClient } from '../../dist/config/redisConnection.js'
import { mockAuthRepository } from '../../dist/features/auth/__mocks__/auth.respository.js'
import {
    NotFoundError,
    UnauthorizedError,
} from '../../dist/errors/httpErrors.js'
import { jest } from '@jest/globals'

const comparePassword = jest.fn()

describe('AuthService.login', () => {
    let authService
    let authRepo

    beforeEach(() => {
        authRepo = mockAuthRepository(jest)
        authService = new AuthService(authRepo, comparePassword)
    })

    it('should throw NotFoundError if user does not exist', async () => {
        authRepo.findByEmail.mockResolvedValue(null)
        await expect(
            authService.login('test@gmail.com', 'password')
        ).rejects.toThrow(NotFoundError)
    })

    it('should throw UnauthorizedError if password is incorrect', async () => {
        authRepo.findByEmail.mockResolvedValue({
            _id: 'user123',
            email: 'test@gmail.com',
            password: 'hashedpassword',
        })
        comparePassword.mockResolvedValue(false)

        await expect(
            authService.login('test@gmail.com', 'wrongpassword')
        ).rejects.toThrow(UnauthorizedError)
    })
})
