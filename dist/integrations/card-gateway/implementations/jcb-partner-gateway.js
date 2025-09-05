"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JcbPartnerGateway = void 0;
const common_1 = require("@nestjs/common");
const card_provider_entity_1 = require("../../../domains/card-provider/card-provider.entity");
let JcbPartnerGateway = class JcbPartnerGateway {
    constructor() {
        this.providerType = card_provider_entity_1.CardProviderType.PARTNER;
        this.providerId = 'jcb-partner';
        this.supportsRealTime = true;
        this.supportsWebhook = true;
        this.connectionStatus = {
            isConnected: true,
            lastSyncAt: new Date(),
            errorCount: 0
        };
    }
    async getCards(companyId) {
        try {
            await this.rateLimiter.checkLimit('getCards');
            const response = await this.jcbApiClient.get('/corporate/cards', {
                params: { corporate_id: companyId },
                headers: this.getAuthHeaders()
            });
            return response.data.cards.map(this.mapJcbCardToCardInfo);
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    async getCardDetails(cardId) {
        const response = await this.jcbApiClient.get(`/cards/${cardId}`, {
            headers: this.getAuthHeaders()
        });
        return this.mapJcbCardToCardInfo(response.data);
    }
    async getTransactions(cardId, startDate, endDate) {
        try {
            const maxRange = 90 * 24 * 60 * 60 * 1000;
            const actualEndDate = Math.min(endDate.getTime(), startDate.getTime() + maxRange);
            const response = await this.jcbApiClient.get(`/cards/${cardId}/transactions`, {
                params: {
                    start_date: startDate.toISOString().split('T')[0],
                    end_date: new Date(actualEndDate).toISOString().split('T')[0]
                },
                headers: this.getAuthHeaders()
            });
            return response.data.transactions.map(this.mapJcbTransactionToTransactionData);
        }
        catch (error) {
            this.handleApiError(error);
            throw error;
        }
    }
    async getTransaction(transactionId) {
        const response = await this.jcbApiClient.get(`/transactions/${transactionId}`, {
            headers: this.getAuthHeaders()
        });
        return this.mapJcbTransactionToTransactionData(response.data);
    }
    async processPayment(request) {
        throw new Error('Direct payment processing not supported for JCB partner cards');
    }
    async suspendCard(cardId) {
        try {
            const response = await this.jcbApiClient.post(`/cards/${cardId}/suspend`, {}, {
                headers: this.getAuthHeaders()
            });
            return response.data.success;
        }
        catch (error) {
            console.error(`Failed to suspend JCB card ${cardId}:`, error);
            return false;
        }
    }
    async activateCard(cardId) {
        try {
            const response = await this.jcbApiClient.post(`/cards/${cardId}/activate`, {}, {
                headers: this.getAuthHeaders()
            });
            return response.data.success;
        }
        catch (error) {
            console.error(`Failed to activate JCB card ${cardId}:`, error);
            return false;
        }
    }
    async updateCardLimits(cardId, limits) {
        try {
            const jcbLimits = {
                daily_limit: limits.dailyLimit
            };
            const response = await this.jcbApiClient.patch(`/cards/${cardId}/limits`, jcbLimits, {
                headers: this.getAuthHeaders()
            });
            return response.data.success;
        }
        catch (error) {
            console.error(`Failed to update JCB card limits ${cardId}:`, error);
            return false;
        }
    }
    async handleWebhook(event) {
        if (!this.verifyJcbWebhookSignature(event)) {
            throw new Error('Invalid JCB webhook signature');
        }
        switch (event.eventType) {
            case 'transaction.created':
                await this.processJcbTransactionWebhook(event);
                break;
            case 'card.status_changed':
                await this.processJcbCardStatusWebhook(event);
                break;
            default:
                console.warn(`Unsupported JCB webhook event: ${event.eventType}`);
        }
    }
    async healthCheck() {
        try {
            const response = await this.jcbApiClient.get('/health', {
                headers: this.getAuthHeaders(),
                timeout: 5000
            });
            return response.status === 200;
        }
        catch {
            return false;
        }
    }
    async getConnectionStatus() {
        const isConnected = await this.healthCheck();
        if (!isConnected) {
            this.connectionStatus.errorCount++;
            this.connectionStatus.lastError = 'Health check failed';
        }
        else {
            this.connectionStatus.errorCount = 0;
            this.connectionStatus.lastError = undefined;
            this.connectionStatus.lastSyncAt = new Date();
        }
        return { ...this.connectionStatus, isConnected };
    }
    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${process.env.JCB_API_TOKEN}`,
            'X-Client-ID': process.env.JCB_CLIENT_ID,
            'Content-Type': 'application/json',
            'User-Agent': 'freee-card-integration/1.0'
        };
    }
    handleApiError(error) {
        this.connectionStatus.errorCount++;
        if (error.response?.status === 429) {
            this.connectionStatus.lastError = 'API rate limit exceeded';
            throw new Error('JCB API rate limit exceeded. Please retry later.');
        }
        else if (error.response?.status === 401) {
            this.connectionStatus.lastError = 'Authentication failed';
            throw new Error('JCB API authentication failed');
        }
        else if (error.response?.status >= 500) {
            this.connectionStatus.lastError = 'JCB server error';
            throw new Error('JCB server is temporarily unavailable');
        }
        else {
            this.connectionStatus.lastError = error.message;
            throw error;
        }
    }
    verifyJcbWebhookSignature(event) {
        const expectedSignature = this.calculateJcbSignature(event);
        return event.signature === expectedSignature;
    }
    calculateJcbSignature(event) {
        return 'mock_signature';
    }
    async processJcbTransactionWebhook(event) {
        const transaction = event.data;
        await this.saveTransactionToFreee(transaction);
        this.syncToFreeeAccountingAsync(transaction);
        await this.checkBudgetAndNotify(transaction);
    }
    async processJcbCardStatusWebhook(event) {
        const cardStatus = event.data;
        await this.syncCardStatusToFreee(cardStatus);
        await this.notifyCardStatusChange(cardStatus);
    }
    mapJcbCardToCardInfo(jcbCard) {
        return {
            externalCardId: jcbCard.card_id,
            cardNumberMasked: this.maskCardNumber(jcbCard.card_number),
            cardHolderName: jcbCard.holder_name,
            expiryDate: `${jcbCard.expiry_month}/${jcbCard.expiry_year.toString().slice(-2)}`,
            cardType: jcbCard.card_type,
            status: this.mapJcbStatusToStandard(jcbCard.status)
        };
    }
    mapJcbTransactionToTransactionData(jcbTransaction) {
        return {
            externalTransactionId: jcbTransaction.transaction_id,
            amount: jcbTransaction.amount,
            merchantName: jcbTransaction.merchant.name,
            merchantCategoryCode: jcbTransaction.merchant.category_code,
            transactionDate: new Date(jcbTransaction.transaction_date),
            postedDate: jcbTransaction.posted_date ? new Date(jcbTransaction.posted_date) : undefined,
            cardNumberMasked: this.maskCardNumber(jcbTransaction.card_number),
            authorizationCode: jcbTransaction.authorization_code,
            currencyCode: jcbTransaction.currency || 'JPY',
            isReversal: jcbTransaction.transaction_type === 'reversal'
        };
    }
    maskCardNumber(cardNumber) {
        if (cardNumber.length < 8)
            return cardNumber;
        const first4 = cardNumber.slice(0, 4);
        const last4 = cardNumber.slice(-4);
        const masked = '*'.repeat(cardNumber.length - 8);
        return `${first4}${masked}${last4}`;
    }
    mapJcbStatusToStandard(jcbStatus) {
        const statusMap = {
            'active': 'active',
            'suspended': 'suspended',
            'blocked': 'suspended',
            'expired': 'expired',
            'cancelled': 'cancelled'
        };
        return statusMap[jcbStatus] || 'unknown';
    }
    async saveTransactionToFreee(transaction) {
    }
    async syncToFreeeAccountingAsync(transaction) {
    }
    async checkBudgetAndNotify(transaction) {
    }
    async syncCardStatusToFreee(cardStatus) {
    }
    async notifyCardStatusChange(cardStatus) {
    }
};
exports.JcbPartnerGateway = JcbPartnerGateway;
exports.JcbPartnerGateway = JcbPartnerGateway = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], JcbPartnerGateway);
//# sourceMappingURL=jcb-partner-gateway.js.map