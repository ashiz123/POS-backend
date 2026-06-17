import { vi, expect, it, describe, Mocked, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import {
    AuthRequest,
    BusinessController,
} from '../../../src/features/business/business.controller'
import { ApiResponse } from '../../../src/types/apiResponseType'
import { ICrudService } from '../../../src/shared/baseService'
import { BusinessProps } from '../../../src/features/business/business.model'

let controller: BusinessController

const mockBusinessData: BusinessProps = {
    name: 'ABC business',
    address: '137 shorncliff road',
    website: 'https:://www.abc.com',
    email: 'abc@xyz.com',
    phone: '9879879889',
    businessType: 'Clothes',
}

describe('Business controller test', () => {
    let req: Partial<AuthRequest>
    let res: Partial<Response>
    let next: NextFunction

    const mockBusinessService = {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    } as unknown as Mocked<ICrudService<BusinessProps>>

    beforeEach(() => {
        vi.clearAllMocks()
        controller = new BusinessController(mockBusinessService)
        req = {
            user: { userId: 'user-123', email: 'ashiz@gmail.com' },
        }
        res = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn().mockReturnThis(),
        }
        next = vi.fn()
    })

    //create test
    it('should create the business', async () => {
        const mockBusinessCreateResponse: ApiResponse<BusinessProps> = {
            success: true,
            data: mockBusinessData,
            message: 'Business created successfully',
        }

        req.body = mockBusinessData
        mockBusinessService.create.mockResolvedValue(mockBusinessData)
        await controller.create(
            req as Request,
            res as Response,
            next as NextFunction
        )

        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith(mockBusinessCreateResponse)
    })

    //update test
    it('should update the business', async () => {
        const mockBusinessUpdateResponse: ApiResponse<BusinessProps> = {
            success: true,
            data: mockBusinessData,
            message: 'Business updated successfully',
        }
        req.params = { id: 'test-business-id' }
        req.body = { name: 'Nepal corporate' }
        mockBusinessService.update.mockResolvedValue(mockBusinessData)
        await controller.update(
            req as Request,
            res as Response,
            next as NextFunction
        )
        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(mockBusinessService.update).toHaveBeenLastCalledWith(
            'test-business-id',
            { name: 'Nepal corporate' }
        )
        expect(res.json).toHaveBeenCalledWith(mockBusinessUpdateResponse)
    })

    //delete test
    it('should delete the business', async () => {
        const mockBusinessDeletedResponse: ApiResponse<object> = {
            success: true,
            data: {},
            message: 'Business deleted successfully',
        }
        req.params = { id: 'test-buinsess-id' }
        mockBusinessService.delete.mockResolvedValue(true)
        await controller.remove(
            req as Request,
            res as Response,
            next as NextFunction
        )
        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(mockBusinessDeletedResponse)
    })

    //show test
    it('should show the business by id', async () => {
        const mockBusinessByIdResponse: ApiResponse<BusinessProps> = {
            success: true,
            data: mockBusinessData,
        }

        req.params = req.params = { id: 'test-buinsess-id' }
        mockBusinessService.getById.mockResolvedValue(mockBusinessData)
        await controller.getById(
            req as Request,
            res as Response,
            next as NextFunction
        )
        expect(next).not.toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith(mockBusinessByIdResponse)
    })
    // Get all test
})
