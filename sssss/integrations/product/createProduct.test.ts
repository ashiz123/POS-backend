import request from 'supertest'
import { describe, it, expect, afterAll } from 'vitest'
import app from '../../../src/config/app'
import {
    CreateProductDTO,
    ProductModel,
} from '../../../src/features/products/product.model'

export const productData: CreateProductDTO = {
    categoryId: '696373bcba24fb62c8619667',
    sku: '1233sd',
    name: 'Shampoo',
    description: 'this is shampoo',
    price: 30,
    costPrice: 30, // To calculate profit margins
    isActive: false,
    businessId: '696373bcba24fb62c8619667',
    stockType: 'stocked',
}

describe('Create the product', () => {
    const product = {
        categoryId: '696373bcba24fb62c8619667',
        sku: '1233sd',
        description: 'this is shampoo',
        price: 30,
        costPrice: 30, // To calculate profit margins
        stockQuantity: 12,
        isActive: false,
    }

    afterAll(async () => {
        await ProductModel.deleteMany()
    })

    it('should create the new user', async () => {
        const response = await request(app)
            .post('/api/product/create')
            .send(productData)

        if (response.status !== 201) {
            console.log(response.body)
        }

        expect(response.status).toBe(201)
    })

    it('should fail the validation', async () => {
        const response = await request(app)
            .post('/api/product/create')
            .send(product)

        if (response.status !== 201) {
            console.log(response.body)
        }

        expect(response.status).toBe(400)
        expect(response.body).toMatchObject({
            error: 'Validation Error',
            path: 'name field is required',
        })
    })
})
