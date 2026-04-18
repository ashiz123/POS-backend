import { Request, NextFunction, Response } from 'express'
import { AuthRequest } from '../../../src/features/business/business.controller'
import { ProductController } from '../../../src/features/products/product.controller'
import { describe, it, expect, beforeEach, vi, Mocked } from 'vitest'
import { ZodError } from 'zod'
import { IProductService } from '../../../src/features/products/product.service'

let productController: ProductController

describe('Create product', () => {
    let req: Partial<AuthRequest>
    let res: Partial<Response>
    let next: NextFunction

    const mockProductService = {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        getProductsByCategory: vi.fn(),
        getProductByDateRange: vi.fn(),
    } as unknown as Mocked<IProductService> //this is same as doing vi.mocked as i asked typescript to convert to Mocked

    const productData = {
        categoryId: '696373bcba24fb62c8619667',
        sku: '1231bc',
        name: 'fake product',
        description: 'this is fake product',
        price: 12,
        costPrice: 10, // To calculate profit margins
        stockQuantity: 10,
        isActive: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        req = {
            user: { userId: 'fake-user', email: 'hamalashiz@gmail.com' }, // Rule #4: Ready for auth checks
        } as unknown as Request
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        next = vi.fn()

        productController = new ProductController(mockProductService)
    })

    it('should fail the validation', async () => {
        req.body = {
            description: 'this is shampoo',
            price: 30,
            costPrice: 30, // To calculate profit margins
            stockQuantity: 12,
            isActive: false,
        }

        await productController.create(
            req as Request,
            res as Response,
            next as NextFunction
        )

        expect(next).toHaveBeenCalled()
        expect(next).toHaveBeenCalledWith(expect.any(ZodError))
    })

    it('should create the new user', async () => {
        req.body = productData
        mockProductService.create.mockResolvedValue(productData)
        await productController.create(
            req as Request,
            res as Response,
            next as NextFunction
        )

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
    })
})
