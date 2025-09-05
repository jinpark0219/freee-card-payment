import { CardProviderType } from '../../domains/card-provider/card-provider.entity';
export interface TransactionData {
    externalTransactionId: string;
    amount: number;
    merchantName: string;
    merchantCategoryCode?: string;
    transactionDate: Date;
    postedDate?: Date;
    cardNumberMasked: string;
    authorizationCode?: string;
    currencyCode: string;
    isReversal: boolean;
}
export interface CardInfo {
    externalCardId: string;
    cardNumberMasked: string;
    cardHolderName: string;
    expiryDate: string;
    cardType: string;
    status: string;
}
export interface PaymentRequest {
    cardId: string;
    amount: number;
    merchantId: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface PaymentResult {
    success: boolean;
    transactionId?: string;
    authorizationCode?: string;
    responseCode: string;
    responseMessage: string;
    processedAt: Date;
}
export interface WebhookEvent {
    eventType: 'transaction.created' | 'transaction.updated' | 'card.status_changed';
    eventId: string;
    timestamp: Date;
    data: any;
    signature?: string;
}
export interface CardGateway {
    readonly providerType: CardProviderType;
    readonly providerId: string;
    readonly supportsRealTime: boolean;
    readonly supportsWebhook: boolean;
    getCards(companyId: string): Promise<CardInfo[]>;
    getCardDetails(cardId: string): Promise<CardInfo>;
    getTransactions(cardId: string, startDate: Date, endDate: Date): Promise<TransactionData[]>;
    getTransaction(transactionId: string): Promise<TransactionData>;
    processPayment?(request: PaymentRequest): Promise<PaymentResult>;
    suspendCard?(cardId: string): Promise<boolean>;
    activateCard?(cardId: string): Promise<boolean>;
    updateCardLimits?(cardId: string, limits: CardLimits): Promise<boolean>;
    handleWebhook?(event: WebhookEvent): Promise<void>;
    healthCheck(): Promise<boolean>;
    getConnectionStatus(): Promise<ConnectionStatus>;
}
export interface CardLimits {
    dailyLimit?: number;
    monthlyLimit?: number;
    singleTransactionLimit?: number;
}
export interface ConnectionStatus {
    isConnected: boolean;
    lastSyncAt?: Date;
    nextSyncAt?: Date;
    errorCount: number;
    lastError?: string;
}
export interface CardGatewayFactory {
    createGateway(providerType: CardProviderType, config: any): CardGateway;
    getSupportedProviders(): CardProviderType[];
}
