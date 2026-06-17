import { describe, it, expect, beforeAll } from 'vitest'
import request from 'supertest'
import app from '../../../src/config/app'
import { CreateCategoryDTO } from '../../../src/features/category/category.model'
import { authService } from '../../../src/features/auth/auth.route'

describe('Category test', () => {
    let authToken: string
    const categoryData: CreateCategoryDTO = {
        businessId: '696373bcba24fb62c8619667',
        title: 'category-1',
        description: 'category 1 description',
        isActive: true,
        parentCategoryId: '696373bcba24fb62c8619612',
    }

    const newUser = {
        name: 'testing',
        email: 'testing@gmail.com',
        phone: '2342342341',
        password: 'testing123',
        status: 'active',
    } as const

    beforeAll(async () => {
        await authService.register(newUser)
        const user = await authService.login('testing@gmail.com', 'testing123')
        authToken = user.token
    })

    it('should create the category', async () => {
        const response = await request(app)
            .post('/api/categories/create')
            .set('Authorization', `Bearer ${authToken}`)
            .send(categoryData)

        expect(response.status).toBe(200)
        expect(response.body.data).toMatchObject({
            businessId: '696373bcba24fb62c8619667',
            title: 'category-1',
            description: 'category 1 description',
            isActive: true,
            parentCategoryId: '696373bcba24fb62c8619612',
        })
    })
})
