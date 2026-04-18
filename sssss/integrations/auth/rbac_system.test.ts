import { describe, it, expect } from 'vitest'
import request from 'supertest'
import app from '../../../src/config/app'

describe('Role base authentication system testing', () => {
    const userAdmin = {
        name: 'admin',
        email: 'admin@gmail.com',
        phone: '2338795674',
        password: 'testing123',
        role: 'admin',
    }

    const userCashier = {
        name: 'cashier',
        email: 'cashier@gmail.com',
        phone: '2338795674',
        password: 'testing123',
        role: 'cashier',
    }

    const newBusiness = {
        name: 'new testing  Trade Hub 2',
        address: '456 Commerce St, New York, NY 10001',
    }

    it('Admin user should allow access to create the business', async () => {
        const newUser = await request(app)
            .post('/api/auth/register')
            .send(userAdmin)

        expect(newUser.body.email).toBe('admin@gmail.com')

        const loginDetail = {
            email: 'admin@gmail.com',
            password: 'testing123',
        }

        const loginUser = await request(app)
            .post('/api/auth/login')
            .send(loginDetail)

        const token = loginUser.body.data.token

        expect(loginUser.body.success).toBe(true)
        expect(loginUser.body.data).toMatchObject({
            email: 'admin@gmail.com',
            token: expect.any(String),
        })

        const createNewBusiness = await request(app)
            .post('/api/business/create')
            .set('Authorization', `Bearer ${token}`)
            .send(newBusiness)

        expect(createNewBusiness.body.success).toBe(true)
        expect(createNewBusiness.body.data.name).toBe(newBusiness.name)
        expect(createNewBusiness.body.message).toBe(
            'Business created successfully'
        )
    })

    it('Cashier user should not access to create the business', async () => {
        const newUser = await request(app)
            .post('/api/auth/register')
            .send(userCashier)

        expect(newUser.body.email).toBe('cashier@gmail.com')

        const loginDetail = {
            email: 'cashier@gmail.com',
            password: 'testing123',
        }

        const loginUser = await request(app)
            .post('/api/auth/login')
            .send(loginDetail)

        const token = loginUser.body.data.token

        expect(loginUser.body.success).toBe(true)
        expect(loginUser.body.data).toMatchObject({
            email: 'cashier@gmail.com',
            token: expect.any(String),
        })
        //fails in this route, because of permission to cashier
        const createNewBusiness = await request(app)
            .post('/api/business/create')
            .set('Authorization', `Bearer ${token}`)
            .send(newBusiness)

        expect(createNewBusiness.body).toMatchObject({
            error: 'Unauthorized user',
        })
    })
})
