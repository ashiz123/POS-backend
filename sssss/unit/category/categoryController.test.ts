import { describe, vi, it, beforeEach, expect } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { CategoryController } from '../../../src/features/category/category.controller'
import { ICategory } from '../../../src/features/category/category.model'
import { ICrudService } from '../../../src/shared/baseService'
import { AuthRequest } from '../../../src/features/business/business.controller'
import { ApiResponse } from '../../../src/types/apiResponseType'

let controller: CategoryController

const mockCategoryService: ICrudService<ICategory> = {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
}

const mockCategoryData: ICategory = Object.freeze({
    businessId: '696373bcba24fb62c8619667',
    title: 'My-Business',
    description: 'this is my buisness',
    isActive: true,
    parentCategoryId: '696173bcba24fb62c8619662',
})

const mockResponse: ApiResponse<ICategory> = {
    success: true,
    data: mockCategoryData,
    message: 'Category added successfully',
}

describe('Category controller test', () => {
    let req: Partial<AuthRequest>
    let res: Partial<Response>
    let next: NextFunction

    beforeEach(() => {
        vi.clearAllMocks()
        req = {
            user: { userId: 'user-123', email: 'ashiz@gmail.com' },
        }
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        next = vi.fn()

        controller = new CategoryController(mockCategoryService)
    })

    it('should fail the validation and call next', async () => {
        req.body = {
            title: 'only title',
        }
        await controller.createCategory(
            req as Request,
            res as Response,
            next as NextFunction
        )

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'ZodError',
            })
        )
    })

    it('should create the category successfully', async () => {
        req.body = mockCategoryData
        vi.mocked(mockCategoryService.create).mockResolvedValue(
            mockCategoryData
        )
        await controller.createCategory(
            req as Request,
            res as Response,
            next as NextFunction
        )
        expect(next).not.toHaveBeenCalled()

        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(mockResponse)
    })

    it('should delete the category', async () => {
        const deleteResponse: ApiResponse<object> = {
            success: true,
            data: {},
            message: 'Category Deleted successfully',
        }
        req.params = { id: 'test-buinsess-id' }
        vi.mocked(mockCategoryService.delete).mockResolvedValue(true)
        await controller.deleteCategory(
            req as Request,
            res as Response,
            next as NextFunction
        )
        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(deleteResponse)
    })

    it('should update the category', async () => {
        const updateResponse: ApiResponse<typeof mockCategoryData> = {
            success: true,
            data: mockCategoryData,
        }
        req.body = { title: 'updated category' }
        req.params = { id: 'test-buinsess-id' }
        vi.mocked(mockCategoryService.update).mockResolvedValue(
            mockCategoryData
        )
        await controller.updateCategory(
            req as Request,
            res as Response,
            next as NextFunction
        )

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(updateResponse)
    })
})
