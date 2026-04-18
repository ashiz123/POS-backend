import { vi, expect, it, describe, beforeEach } from 'vitest'
import { IBusinessRepository } from '../../../src/features/business/business.repository'
import { BusinessProps } from '../../../src/features/business/business.model'
import {
    AuthUserBusinessProps,
    BusinessService,
} from '../../../src/features/business/business.service'
import { IBusinessDocument } from '../../../src/features/business/database/business_db_model'

let businessService: BusinessService
const authUserId: string = '696373bcba24fb62c8619662'
const businessId: string = '696373bcba24fb62c8619667'

//this types is identical to CreateBusinessDT
const mockBusinessData: BusinessProps = {
    name: 'ABC business',
    address: '137 shorncliff road',
    website: 'https:://www.abc.com',
    email: 'abc@xyz.com',
    phone: '9879879889',
    businessType: 'Clothes',
}

//Businsee type with auth
const mockAuthInput: AuthUserBusinessProps = {
    ...mockBusinessData,
    userId: authUserId,
}

describe('Business service test', () => {
    //mocking repo
    const mockBusinessRepo: IBusinessRepository = {
        findAll: vi.fn(),
        findById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        filterByUserId: vi.fn(),
        filterByName: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
        businessService = new BusinessService(mockBusinessRepo)
    })

    it('should successfully create the business and response business data', async () => {
        vi.mocked(mockBusinessRepo.create).mockResolvedValue(
            mockBusinessData as IBusinessDocument
        ) //we have to use vi.mocked instead directly mockBusinessRepository becaus the create is inside the parent class.
        const result = await businessService.create(mockAuthInput)
        expect(result).toEqual(mockBusinessData)
        expect(mockBusinessRepo.create).toHaveBeenCalledWith(
            expect.objectContaining(mockBusinessData)
        )
    })

    it('should successfully update the business and response business data', async () => {
        const dataToUpdate: Partial<BusinessProps> = {
            name: 'testing business',
        }

        const mockUpdatedBusiness = {
            ...mockBusinessData,
            name: dataToUpdate.name,
        }

        vi.mocked(mockBusinessRepo.update).mockResolvedValue(
            mockUpdatedBusiness as IBusinessDocument
        )
        const result = await businessService.update(businessId, dataToUpdate)
        console.log(result)
        expect(result).toEqual(mockUpdatedBusiness)
    })

    it('should delete the business', async () => {
        vi.mocked(mockBusinessRepo.delete).mockResolvedValue(true)
        const result = await businessService.delete(businessId)
        expect(result).toEqual(true)
    })

    it('should find the business by name', async () => {
        vi.mocked(mockBusinessRepo.filterByName).mockResolvedValue(
            mockBusinessData as IBusinessDocument
        )
        const result =
            await businessService.filterBusinessByName('ABC business')
        expect(result).toBe(mockBusinessData)
    })

    it('should find the business by authenticated user', async () => {
        const businessList = [
            {
                name: 'ABC business',
                address: '137 shorncliff road',
                website: 'https:://www.abc.com',
                email: 'abc@xyz.com',
                phone: '9879879889',
                businessType: 'Clothes',
            },
            {
                name: 'testing business',
                address: '137 shorncliff road',
                website: 'https:://www.xyz.com',
                email: 'abc@xyz.com',
                phone: '9879879889',
                businessType: 'shoes',
            },
        ]

        vi.mocked(mockBusinessRepo.filterByUserId).mockResolvedValue(
            businessList as IBusinessDocument[]
        )

        const result =
            await businessService.filterBusinessByAuthUser(authUserId)
        expect(result).toBe(businessList)
    })
})
