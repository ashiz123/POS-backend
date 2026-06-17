import { describe, expect, it, beforeEach, beforeAll, afterAll } from 'vitest'
import { ProductModel } from '../../../src/features/products/product.model'
import request from 'supertest'
import app from '../../../src/config/app'

describe('Filter product', () => {
    beforeAll(async () => {
        const products = [
            {
                categoryId: '696373bcba24fb62c8619667',
                name: 'product-1',
                sku: '123abc',
                description: 'this is shampoo',
                price: 30,
                costPrice: 30,
                stockQuantity: 12,
                isActive: false,
            },
            {
                categoryId: '696373bcba24fb62c8619647',
                name: 'product-2',
                sku: '456abc',
                description: 'this is shampoo',
                price: 30,
                costPrice: 30,
                stockQuantity: 12,
                isActive: false,
            },
            {
                categoryId: '696373bcba24fb62c8619667',
                name: 'product-3',
                sku: '789abc',
                description: 'this is shampoo',
                price: 30,
                costPrice: 30,
                stockQuantity: 12,
                isActive: false,
            },
        ]

        await ProductModel.insertMany(products)
    })

    afterAll(async () => {
        await ProductModel.deleteMany()
    })

    it('should display the product filter by categoryId', async () => {
        const response = await request(app).get(
            '/api/product/ofCategory/696373bcba24fb62c8619667'
        )
        console.log(response.body.data)
        expect(response.status).toBe(200)
        expect(response.body.data[0]).toMatchObject({
            categoryId: '696373bcba24fb62c8619667',
            name: 'product-1',
            sku: '123ABC',
            description: 'this is shampoo',
            price: 30,
            costPrice: 30,
            stockQuantity: 12,
            isActive: false,
        })
        expect(response.body.data[1]).toMatchObject({
            categoryId: '696373bcba24fb62c8619667',
            name: 'product-3',
            sku: '789ABC',
            description: 'this is shampoo',
            price: 30,
            costPrice: 30,
            stockQuantity: 12,
            isActive: false,
        })
    })
})
