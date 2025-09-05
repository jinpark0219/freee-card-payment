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
exports.FreeeNativeGateway = void 0;
const common_1 = require("@nestjs/common");
const card_provider_entity_1 = require("../../../domains/card-provider/card-provider.entity");
let FreeeNativeGateway = class FreeeNativeGateway {
    constructor(freeeCardApiClient, riskEngine, budgetService) {
        this.freeeCardApiClient = freeeCardApiClient;
        this.riskEngine = riskEngine;
        this.budgetService = budgetService;
        this.providerType = card_provider_entity_1.CardProviderType.FREEE_NATIVE;
        this.providerId = 'freee-native';
        this.supportsRealTime = true;
        this.supportsWebhook = true;
    }
    async getCards(companyId) {
        try {
            const response = await this.freeeCardApiClient.get(`/companies/${companyId}/cards`);
            return response.data.map(this.mapToCardInfo);
        }
        catch (error) {
            throw new Error(`Failed to fetch freee cards: ${error.message}`);
        }
    }
    async getCardDetails(cardId) {
        const response = await this.freeeCardApiClient.get(`/cards/${cardId}`);
        return this.mapToCardInfo(response.data);
    }
    async getTransactions(cardId, startDate, endDate) {
        const response = await this.freeeCardApiClient.get(`/cards/${cardId}/transactions`, {
            params: {
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString()
            }
        });
        return response.data.map(this.mapToTransactionData);
    }
    async getTransaction(transactionId) {
        const response = await this.freeeCardApiClient.get(`/transactions/${transactionId}`);
        return this.mapToTransactionData(response.data);
    }
    async processPayment(request) {
        try {
            await this.validatePaymentRequest(request);
            const budgetCheck = await this.budgetService.checkBudget(request.cardId, request.amount);
            if (!budgetCheck.allowed) {
                return {
                    success: false,
                    responseCode: 'BUDGET_EXCEEDED',
                    responseMessage: budgetCheck.reason,
                    processedAt: new Date()
                };
            }
            const riskScore = await this.riskEngine.assessRisk({
                cardId: request.cardId,
                amount: request.amount,
                merchantId: request.merchantId
            });
            if (riskScore > 0.8) {
                await this.holdTransaction(request);
                return {
                    success: false,
                    responseCode: 'RISK_HOLD',
                    responseMessage: 'Transaction held for manual review',
                    processedAt: new Date()
                };
            }
            const response = await this.freeeCardApiClient.post('/payments', {
                card_id: request.cardId,
                amount: request.amount,
                merchant_id: request.merchantId,
                description: request.description,
                metadata: request.metadata
            });
            return {
                success: true,
                transactionId: response.data.transaction_id,
                authorizationCode: response.data.authorization_code,
                responseCode: 'APPROVED',
                responseMessage: 'Transaction approved',
                processedAt: new Date(response.data.processed_at)
            };
        }
        catch (error) {
            return {
                success: false,
                responseCode: 'SYSTEM_ERROR',
                responseMessage: error.message,
                processedAt: new Date()
            };
        }
    }
    async suspendCard(cardId) {
        try {
            await this.freeeCardApiClient.patch(`/cards/${cardId}/suspend`);
            return true;
        }
        catch (error) {
            console.error(`Failed to suspend freee card ${cardId}:`, error);
            return false;
        }
    }
    async activateCard(cardId) {
        try {
            await this.freeeCardApiClient.patch(`/cards/${cardId}/activate`);
            return true;
        }
        catch (error) {
            console.error(`Failed to activate freee card ${cardId}:`, error);
            return false;
        }
    }
    async updateCardLimits(cardId, limits) {
        try {
            await this.freeeCardApiClient.patch(`/cards/${cardId}/limits`, limits);
            return true;
        }
        catch (error) {
            console.error(`Failed to update freee card limits ${cardId}:`, error);
            return false;
        }
    }
    async handleWebhook(event) {
        switch (event.eventType) {
            case 'transaction.created':
                await this.handleNewTransaction(event);
                break;
            case 'transaction.updated':
                await this.handleUpdatedTransaction(event);
                break;
            case 'card.status_changed':
                await this.handleCardStatusChange(event);
                break;
            default:
                console.warn(`Unknown webhook event type: ${event.eventType}`);
        }
    }
    async healthCheck() {
        try {
            await this.freeeCardApiClient.get('/health');
            return true;
        }
        catch {
            return false;
        }
    }
    async getConnectionStatus() {
        const isConnected = await this.healthCheck();
        return {
            isConnected,
            lastSyncAt: new Date(),
            errorCount: 0
        };
    }
    async validatePaymentRequest(request) {
        if (!request.cardId || !request.amount || !request.merchantId) {
            throw new Error('Missing required payment parameters');
        }
        if (request.amount <= 0) {
            throw new Error('Payment amount must be positive');
        }
    }
    async holdTransaction(request) {
        await this.freeeCardApiClient.post('/transactions/hold', {
            card_id: request.cardId,
            amount: request.amount,
            reason: 'High risk score detected'
        });
    }
    async handleNewTransaction(event) {
        const transaction = event.data;
        await this.syncToFreeeAccounting(transaction);
        await this.budgetService.updateBudgetUsage(transaction.card_id, transaction.amount);
        await this.sendRealTimeNotification(transaction);
    }
    async handleUpdatedTransaction(event) {
        const transaction = event.data;
        await this.updateFreeeAccountingEntry(transaction);
    }
    async handleCardStatusChange(event) {
        const cardInfo = event.data;
        await this.notifyCardStatusChange(cardInfo);
    }
    mapToCardInfo(data) {
        return {
            externalCardId: data.id,
            cardNumberMasked: data.card_number_masked,
            cardHolderName: data.card_holder_name,
            expiryDate: data.expiry_date,
            cardType: data.card_type,
            status: data.status
        };
    }
    mapToTransactionData(data) {
        return {
            externalTransactionId: data.id,
            amount: data.amount,
            merchantName: data.merchant_name,
            merchantCategoryCode: data.mcc,
            transactionDate: new Date(data.transaction_date),
            postedDate: data.posted_date ? new Date(data.posted_date) : undefined,
            cardNumberMasked: data.card_number_masked,
            authorizationCode: data.authorization_code,
            currencyCode: data.currency_code || 'JPY',
            isReversal: data.is_reversal || false
        };
    }
    async syncToFreeeAccounting(transaction) {
    }
    async updateFreeeAccountingEntry(transaction) {
    }
    async sendRealTimeNotification(transaction) {
    }
    async notifyCardStatusChange(cardInfo) {
    }
};
exports.FreeeNativeGateway = FreeeNativeGateway;
exports.FreeeNativeGateway = FreeeNativeGateway = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, Object])
], FreeeNativeGateway);
//# sourceMappingURL=freee-native-gateway.js.map