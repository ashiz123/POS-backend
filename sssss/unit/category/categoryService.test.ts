import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CategoryService } from '../../../src/features/category/category.service'
import { ICategory } from '../../../src/features/category/category.model'
import { ICategoryRepository } from '../../../src/features/category/category.repository'
import { ICategoryDocument } from '../../../src/database/categories_model'

describe('Category service test', () => {
    //write data
    let mockCategoryService: CategoryService
    const mockCategoryData: ICategory = {
        businessId: '696373bcba24fb62c8619667',
        title: 'My-Business',
        description: 'this is my buisness',
        isActive: true,
        parentCategoryId: '696173bcba24fb62c8619662',
    }

    //mock category repository
    const mockCategoryRepository: ICategoryRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getChildren: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        mockCategoryService = new CategoryService(mockCategoryRepository)
    })

    it('should create the service successfully', async () => {
        vi.mocked(mockCategoryRepository.create).mockResolvedValue(
            mockCategoryData as ICategoryDocument
        )
        const result = await mockCategoryService.create(mockCategoryData)
        expect(result).toBe(mockCategoryData)
    })

    it('should update the service successfully', async () => {
        const updatedData = {
            title: 'new-Business',
        }
        const newCategoryData = {
            ...mockCategoryData,
            title: updatedData.title,
        }
        vi.mocked(mockCategoryRepository.update).mockResolvedValue(
            newCategoryData as ICategoryDocument
        )

        const result = await mockCategoryService.update('fake-id', updatedData)
        expect(result).toBe(newCategoryData)
    })
})
