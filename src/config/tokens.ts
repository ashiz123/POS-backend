export const TOKENS = {
    DATABASE_CONNECTION: Symbol.for('Database_connection'),
    NOTIFICATION_EMITTER: Symbol.for('Notification emitter'),

    STRIPE_PAYMENT_SERVICE: Symbol.for('IStripePaymentService'),

    COMPARE_PASSWORD: Symbol.for('ComparePassword'),
    JWT_SIGN_IN: Symbol.for('JwtSignIn'),
    JWT_TERMINAL_SIGN_IN: Symbol.for('JwtTerminalSignIn'),
    GENERATE_TOKEN: Symbol.for('GenerateToken'),
    CRYPTO_SERVICE: Symbol.for('ICryptoService'),

    AUTHCODE_MODEL: Symbol.for('AuthCodeModel'),
    AUTHCODE_REPOSITORY: Symbol.for('IAuthCodeRepository'),
    AUTHCODE_SERVICE: Symbol.for('IAuthCodeService'),

    USER_SERVICE: Symbol.for('IUserService'),
    USER_CONTROLLER: Symbol.for('IUserController'),
    USER_REPOSITORY: Symbol.for('IUserRepository'),

    BUSINESS_REPOSITORY: Symbol.for('IBusinessRepository'),
    BUSINESS_SERVICE: Symbol.for('IBusinessService'),
    BUSINESS_CONTROLLER: Symbol.for('IBusinessController'),

    USER_BUSINESS_REPOSITORY: Symbol.for('IUserBusinessRepository'),
    USER_BUSINESS_SERVICE: Symbol.for('IUserBusinessService'),
    USER_BUSINESS_CONTROLLER: Symbol.for('IUserBusinessController'),

    INVENTORY_BATCH_SERVICE: Symbol.for('IInventoryBatchService'),
    INVENTORY_BATCH_CONTROLLER: Symbol.for('IInventoryBatchController'),
    INVENTORY_BATCH_REPOSITORY: Symbol.for('IInventoryBatchRepository'),

    PRODUCT_SERVICE: Symbol.for('IProductService'),
    PRODUCT_CONTROLLER: Symbol.for('IProductController'),
    PRODUCT_REPOSITORY: Symbol.for('IProductRepository'),

    ORDER_SERVICE: Symbol.for('IOrderService'),
    ORDER_CONTROLLER: Symbol.for('IOrderController'),
    ORDER_REPOSITORY: Symbol.for('IOrderRepository'),

    COUNTER_REPOSITORY: Symbol.for('ICounterRepository'),

    ORDER_ITEM_REPOSITORY: Symbol.for('IOrderItemRepository'),

    PAYMENT_REPOSITORY: Symbol.for('IPaymentRepository'),
    PAYMENT_SERVICE: Symbol.for('IPaymentService'),

    TERMINAL_REPOSITORY: Symbol.for('ITerminalRepository'),
    TERMINAL_SERVICE: Symbol.for('ITerminalService'),
    TERMINAL_CONTROLLER: Symbol.for('ITerminalController'),
    TERMINAL_SESSION_MODEL: Symbol.for('TerminalSessionModel'),
    TERMINAL_SESSION_REPOSITORY: Symbol.for('ITerminalSessionRepository'),
    TERMINAL_SESSION_SERVICE: Symbol.for('ITerminalSessionService'),

    AUTH_REPOSITORY: Symbol.for('IAuthRepository'),
    AUTH_SERVICE: Symbol.for('IAuthService'),

    REDIS_CONNECT: Symbol.for('redis'),
    SESSION_SERVICE: Symbol.for('ISessionService'),

    ADMIN_REQUEST_MODEL: Symbol.for('AdminRequestModel'),
    ADMIN_REQUEST_REPOSITORY: Symbol.for('IAdminRequestRepository'),
    ADMIN_REQUEST_SERVICE: Symbol.for('IAdminRequestService'),

    NOTIFICATION_ADMIN_QUEUE: Symbol.for('NotificationAdminQueue'),
    NOTIFICATION_OWNER_QUEUE: Symbol.for('NotificationOwnerQueue'),
    NOTIFICATION_MODEL: Symbol.for('NotificationModel'),
    NOTIFICATION_REPOSITORY: Symbol.for('INotificationRepository'),
    NOTIFICATION_SERVICE: Symbol.for('INotificationService'),
    NOTIFICATION_CONTROLLER: Symbol.for('INotificationController'),
}
