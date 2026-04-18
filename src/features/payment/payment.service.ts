import { inject, injectable } from 'tsyringe'
import { IPaymentRepository, IPaymentService } from './payment.types'
import { TOKENS } from '../../config/tokens'
import { IPaymentDocument, PaymentType } from './payment.model'
import { ClientSession } from 'mongoose'

@injectable()
export class PaymentService implements IPaymentService {
    constructor(
        @inject(TOKENS.PAYMENT_REPOSITORY)
        private paymentRepository: IPaymentRepository
    ) {}

    async createPayment(
        data: PaymentType,
        session: ClientSession
    ): Promise<IPaymentDocument> {
        const { orderId, amount, stripePaymentId } = data

        if (!orderId || !stripePaymentId) {
            throw new Error(
                'Missing unique identifiers: orderId and stripePaymentIntentId are required.'
            )
        }

        if (amount <= 0) {
            throw new Error('Amount is missing')
        }

        const createPayment = await this.paymentRepository.create(data, session)
        return createPayment
    }
}
