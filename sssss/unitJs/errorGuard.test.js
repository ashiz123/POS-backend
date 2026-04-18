import { isMongoDuplicateKeyError, isHttpError } from '../../dist/errors/guard'

describe('isMongoDuplicateKeyError', () => {
    it('should return true for a MongoDB duplicate key error', () => {
        const duplicateKeyError = {
            code: 11000,
            message: 'Duplicate key error',
        }
        expect(isMongoDuplicateKeyError(duplicateKeyError)).toBe(true)
    })

    it('should return false for a non-duplicate key error', () => {
        const otherError = { code: 2000, message: 'some other error' }
        expect(isMongoDuplicateKeyError(otherError)).toBe(false)
    })

    it('should return false for a non-object error', () => {
        const nonObjectError = 'This is a string error'
        expect(isMongoDuplicateKeyError(nonObjectError)).toBe(false)
    })

    it('should return false for null', () => {
        expect(isMongoDuplicateKeyError(null)).toBe(false)
    })

    it('should return false for an object without code property', () => {
        const errorWithoutCode = { message: 'No code here' }
        expect(isMongoDuplicateKeyError(errorWithoutCode)).toBe(false)
    })
})

describe('isHttpError', () => {
    it('should return true if error type is baseError', () => {
        const httpError = {
            statusCode: 404,
            expose: true,
            type: 'baseError',
        }
        expect(isHttpError(httpError)).toBe(true)
    })

    it('should return false if error type is not baseError', () => {
        const nonHttpError = {
            statusCode: 500,
            expose: false,
            type: 'someOtherError',
        }
        expect(isHttpError(nonHttpError)).toBe(false)
    })

    it('should return false for non-object errors', () => {
        expect(isHttpError('This is a string error')).toBe(false)
        expect(isHttpError(12345)).toBe(false)
        expect(isHttpError(null)).toBe(false)
    })
})
