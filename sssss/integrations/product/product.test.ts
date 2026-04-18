import { beforeAll, describe, expect, it } from 'vitest'
import { productData } from './createProduct.test'
import request from 'supertest'
import app from '../../../src/config/app'
import {
    IProduct,
    IProductDocument,
    UpdateProductDTO,
} from '../../../src/features/products/product.model'

let newProduct: IProductDocument

const responseData = {
    ...productData,
    sku: productData.sku.toUpperCase(),
}

describe.sequential('Operation with the product', () => {
    beforeAll(async () => {
        const response = await request(app)
            .post('/api/product/create')
            .send(productData)

        if (!response.body.data) {
            throw new Error(
                '⛔ DEPENDENCY ERROR: Product was not created. Stopping suite.'
            )
        }

        newProduct = response.body.data
    })

    //show here
    it('should show the product', async () => {
        const response = await request(app).get(
            `/api/product/${newProduct._id}`
        )

        console.log(response.body.data)
        expect(response.status).toBe(200)
        expect(response.body.data).toMatchObject<Partial<IProduct>>(
            responseData
        )
    })

    it('should get list of the product', async () => {
        const response = await request(app).get('/api/product')
        expect(response.status).toBe(200)
        expect(response.body.data[0]).toMatchObject({
            name: responseData.name,
            categoryId: responseData.categoryId,
            sku: responseData.sku,
        })
    })

    it('should update the product data', async () => {
        const updateProductData: UpdateProductDTO = {
            name: 'Updated Shampoo',
        }

        const response = await request(app)
            .put(`/api/product/update/${newProduct._id}`)
            .send(updateProductData)

        expect(response.status).toBe(200)
        expect(response.body.data.name).toBe('Updated Shampoo')
    })

    it('should delete the product successfully', async () => {
        const response = await request(app).delete(
            `/api/product/delete/${newProduct._id}`
        )
        expect(response.status).toBe(200)
    })
})
