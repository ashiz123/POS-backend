import { describe, it, expect } from 'vitest'

import { CreateCategorySchema } from '../../../src/features/category/validations/createCategoryValidation'

//category validation test
describe('validation test', () => {
    it('return true as title is valid', () => {
        const validData = {
            title: 'New Title',
            description: 'testing again',
            businessId: '6968c7d12c1f9a3c56f3ab8a',
            isActive: true,
        }
        const result = CreateCategorySchema.safeParse(validData)
        expect(result.success).toBe(true)
    })

    it('return false as title cannot be null', () => {
        const validData = { title: '' }
        const result = CreateCategorySchema.safeParse(validData)
        expect(result.success).toBe(false)
    })

    it('should throw error when parsing invalid data', () => {
        const invalidData = { title: 123 } // String हुनुपर्नेमा Number
        expect(() => CreateCategorySchema.parse(invalidData)).toThrow()
    })

    it('should throw error when businessId is missing (Required field test)', () => {
        const invalidData = {
            title: 'New Category',
            businessId: 'wrong-businessId-pattern',
        }

        expect(() => CreateCategorySchema.parse(invalidData)).toThrow()
    })
})
