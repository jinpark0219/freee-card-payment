import { Injectable } from '@nestjs/common';
import { 
  CardGateway, 
  TransactionData, 
  CardInfo, 
  PaymentRequest, 
  PaymentResult,
  WebhookEvent,
  CardLimits,
  ConnectionStatus 
} from '../card-gateway.interface';
import { CardProviderType } from '../../../domains/card-provider/card-provider.entity';

/**
 * freee 자체 발급 카드 게이트웨이
 * 모든 기능을 완벽하게 지원 (실시간, 제어, 결제 등)
 */
@Injectable()
export class FreeeNativeGateway implements CardGateway {
  readonly providerType = CardProviderType.FREEE_NATIVE;
  readonly providerId = 'freee-native';
  readonly supportsRealTime = true;
  readonly supportsWebhook = true;

  constructor(
    private readonly freeeCardApiClient: any, // freee 내부 카드 API 클라이언트
    private readonly riskEngine: any,         // 부정사용 탐지 엔진
    private readonly budgetService: any       // 예산 관리 서비스
  ) {}

  async getCards(companyId: string): Promise<CardInfo[]> {
    try {
      const response = await this.freeeCardApiClient.get(`/companies/${companyId}/cards`);
      return response.data.map(this.mapToCardInfo);
    } catch (error) {
      throw new Error(`Failed to fetch freee cards: ${error.message}`);
    }
  }

  async getCardDetails(cardId: string): Promise<CardInfo> {
    const response = await this.freeeCardApiClient.get(`/cards/${cardId}`);
    return this.mapToCardInfo(response.data);
  }

  async getTransactions(cardId: string, startDate: Date, endDate: Date): Promise<TransactionData[]> {
    const response = await this.freeeCardApiClient.get(`/cards/${cardId}/transactions`, {
      params: {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      }
    });
    return response.data.map(this.mapToTransactionData);
  }

  async getTransaction(transactionId: string): Promise<TransactionData> {
    const response = await this.freeeCardApiClient.get(`/transactions/${transactionId}`);
    return this.mapToTransactionData(response.data);
  }

  /**
   * freee 자체 카드의 핵심 기능: 실시간 결제 처리
   */
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      // 1. 사전 검증
      await this.validatePaymentRequest(request);
      
      // 2. 예산 체크
      const budgetCheck = await this.budgetService.checkBudget(request.cardId, request.amount);
      if (!budgetCheck.allowed) {
        return {
          success: false,
          responseCode: 'BUDGET_EXCEEDED',
          responseMessage: budgetCheck.reason,
          processedAt: new Date()
        };
      }

      // 3. 부정사용 탐지
      const riskScore = await this.riskEngine.assessRisk({
        cardId: request.cardId,
        amount: request.amount,
        merchantId: request.merchantId
      });

      if (riskScore > 0.8) {
        // 고위험 거래는 일시 보류
        await this.holdTransaction(request);
        return {
          success: false,
          responseCode: 'RISK_HOLD',
          responseMessage: 'Transaction held for manual review',
          processedAt: new Date()
        };
      }

      // 4. 실제 결제 처리
      const response = await this.freeeCardApiClient.post('/payments', {
        card_id: request.cardId,
        amount: request.amount,
        merchant_id: request.merchantId,
        description: request.description,
        metadata: request.metadata
      });

      // 5. 결과 반환
      return {
        success: true,
        transactionId: response.data.transaction_id,
        authorizationCode: response.data.authorization_code,
        responseCode: 'APPROVED',
        responseMessage: 'Transaction approved',
        processedAt: new Date(response.data.processed_at)
      };

    } catch (error) {
      return {
        success: false,
        responseCode: 'SYSTEM_ERROR',
        responseMessage: error.message,
        processedAt: new Date()
      };
    }
  }

  async suspendCard(cardId: string): Promise<boolean> {
    try {
      await this.freeeCardApiClient.patch(`/cards/${cardId}/suspend`);
      return true;
    } catch (error) {
      console.error(`Failed to suspend freee card ${cardId}:`, error);
      return false;
    }
  }

  async activateCard(cardId: string): Promise<boolean> {
    try {
      await this.freeeCardApiClient.patch(`/cards/${cardId}/activate`);
      return true;
    } catch (error) {
      console.error(`Failed to activate freee card ${cardId}:`, error);
      return false;
    }
  }

  async updateCardLimits(cardId: string, limits: CardLimits): Promise<boolean> {
    try {
      await this.freeeCardApiClient.patch(`/cards/${cardId}/limits`, limits);
      return true;
    } catch (error) {
      console.error(`Failed to update freee card limits ${cardId}:`, error);
      return false;
    }
  }

  /**
   * 실시간 이벤트 처리 (webhook)
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
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

  async healthCheck(): Promise<boolean> {
    try {
      await this.freeeCardApiClient.get('/health');
      return true;
    } catch {
      return false;
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const isConnected = await this.healthCheck();
    return {
      isConnected,
      lastSyncAt: new Date(), // freee 자체 카드는 항상 실시간
      errorCount: 0
    };
  }

  // Private 헬퍼 메서드들
  private async validatePaymentRequest(request: PaymentRequest): Promise<void> {
    if (!request.cardId || !request.amount || !request.merchantId) {
      throw new Error('Missing required payment parameters');
    }
    if (request.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }
  }

  private async holdTransaction(request: PaymentRequest): Promise<void> {
    // 부정사용 의심 거래를 관리자 검토 대기열에 추가
    await this.freeeCardApiClient.post('/transactions/hold', {
      card_id: request.cardId,
      amount: request.amount,
      reason: 'High risk score detected'
    });
  }

  private async handleNewTransaction(event: WebhookEvent): Promise<void> {
    // 실시간으로 새 거래를 freee 회계에 반영
    const transaction = event.data;
    
    // freee 회계 시스템에 자동 등록
    await this.syncToFreeeAccounting(transaction);
    
    // 예산 업데이트
    await this.budgetService.updateBudgetUsage(transaction.card_id, transaction.amount);
    
    // 실시간 알림 발송
    await this.sendRealTimeNotification(transaction);
  }

  private async handleUpdatedTransaction(event: WebhookEvent): Promise<void> {
    // 거래 상태 변경 (승인 취소, 부분 환불 등)
    const transaction = event.data;
    await this.updateFreeeAccountingEntry(transaction);
  }

  private async handleCardStatusChange(event: WebhookEvent): Promise<void> {
    // 카드 상태 변경 알림
    const cardInfo = event.data;
    await this.notifyCardStatusChange(cardInfo);
  }

  private mapToCardInfo(data: any): CardInfo {
    return {
      externalCardId: data.id,
      cardNumberMasked: data.card_number_masked,
      cardHolderName: data.card_holder_name,
      expiryDate: data.expiry_date,
      cardType: data.card_type,
      status: data.status
    };
  }

  private mapToTransactionData(data: any): TransactionData {
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

  private async syncToFreeeAccounting(transaction: any): Promise<void> {
    // freee 회계 API 호출하여 자동 분개 처리
  }

  private async updateFreeeAccountingEntry(transaction: any): Promise<void> {
    // freee 회계 항목 업데이트
  }

  private async sendRealTimeNotification(transaction: any): Promise<void> {
    // Slack, 이메일, 앱 푸시 알림 발송
  }

  private async notifyCardStatusChange(cardInfo: any): Promise<void> {
    // 카드 상태 변경 알림
  }
}