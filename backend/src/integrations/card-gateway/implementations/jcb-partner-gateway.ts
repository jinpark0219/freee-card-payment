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
 * JCB 제휴 카드 게이트웨이
 * 일본 최대 카드사인 JCB와의 제휴를 통한 준실시간 연동
 * 결제 처리는 JCB가 담당, freee는 데이터 수집 및 회계 연동
 */
@Injectable()
export class JcbPartnerGateway implements CardGateway {
  readonly providerType = CardProviderType.PARTNER;
  readonly providerId = 'jcb-partner';
  readonly supportsRealTime = true;  // JCB API 2.0 지원
  readonly supportsWebhook = true;

  private readonly jcbApiClient: any;
  private readonly rateLimiter: any;
  private connectionStatus: ConnectionStatus;

  constructor() {
    this.connectionStatus = {
      isConnected: true,
      lastSyncAt: new Date(),
      errorCount: 0
    };
  }

  async getCards(companyId: string): Promise<CardInfo[]> {
    try {
      await this.rateLimiter.checkLimit('getCards'); // JCB API 호출 제한 체크
      
      const response = await this.jcbApiClient.get('/corporate/cards', {
        params: { corporate_id: companyId },
        headers: this.getAuthHeaders()
      });

      return response.data.cards.map(this.mapJcbCardToCardInfo);
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getCardDetails(cardId: string): Promise<CardInfo> {
    const response = await this.jcbApiClient.get(`/cards/${cardId}`, {
      headers: this.getAuthHeaders()
    });
    return this.mapJcbCardToCardInfo(response.data);
  }

  async getTransactions(cardId: string, startDate: Date, endDate: Date): Promise<TransactionData[]> {
    try {
      // JCB는 최대 90일치 데이터만 제공
      const maxRange = 90 * 24 * 60 * 60 * 1000; // 90일 in milliseconds
      const actualEndDate = Math.min(endDate.getTime(), startDate.getTime() + maxRange);

      const response = await this.jcbApiClient.get(`/cards/${cardId}/transactions`, {
        params: {
          start_date: startDate.toISOString().split('T')[0], // YYYY-MM-DD 형식
          end_date: new Date(actualEndDate).toISOString().split('T')[0]
        },
        headers: this.getAuthHeaders()
      });

      return response.data.transactions.map(this.mapJcbTransactionToTransactionData);
    } catch (error) {
      this.handleApiError(error);
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<TransactionData> {
    const response = await this.jcbApiClient.get(`/transactions/${transactionId}`, {
      headers: this.getAuthHeaders()
    });
    return this.mapJcbTransactionToTransactionData(response.data);
  }

  // JCB 제휴카드는 직접 결제 처리 불가 (JCB 시스템에서 처리)
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    throw new Error('Direct payment processing not supported for JCB partner cards');
  }

  // 제한적 카드 제어 (일부 기능만 지원)
  async suspendCard(cardId: string): Promise<boolean> {
    try {
      const response = await this.jcbApiClient.post(`/cards/${cardId}/suspend`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data.success;
    } catch (error) {
      console.error(`Failed to suspend JCB card ${cardId}:`, error);
      return false;
    }
  }

  async activateCard(cardId: string): Promise<boolean> {
    try {
      const response = await this.jcbApiClient.post(`/cards/${cardId}/activate`, {}, {
        headers: this.getAuthHeaders()
      });
      return response.data.success;
    } catch (error) {
      console.error(`Failed to activate JCB card ${cardId}:`, error);
      return false;
    }
  }

  async updateCardLimits(cardId: string, limits: CardLimits): Promise<boolean> {
    try {
      // JCB는 일별 한도만 수정 가능
      const jcbLimits = {
        daily_limit: limits.dailyLimit
      };
      
      const response = await this.jcbApiClient.patch(`/cards/${cardId}/limits`, jcbLimits, {
        headers: this.getAuthHeaders()
      });
      return response.data.success;
    } catch (error) {
      console.error(`Failed to update JCB card limits ${cardId}:`, error);
      return false;
    }
  }

  /**
   * JCB webhook 처리 (준실시간 - 약 30초~2분 지연)
   */
  async handleWebhook(event: WebhookEvent): Promise<void> {
    // JCB 서명 검증
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

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.jcbApiClient.get('/health', {
        headers: this.getAuthHeaders(),
        timeout: 5000
      });
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async getConnectionStatus(): Promise<ConnectionStatus> {
    const isConnected = await this.healthCheck();
    
    if (!isConnected) {
      this.connectionStatus.errorCount++;
      this.connectionStatus.lastError = 'Health check failed';
    } else {
      this.connectionStatus.errorCount = 0;
      this.connectionStatus.lastError = undefined;
      this.connectionStatus.lastSyncAt = new Date();
    }

    return { ...this.connectionStatus, isConnected };
  }

  // Private 메서드들
  private getAuthHeaders() {
    return {
      'Authorization': `Bearer ${process.env.JCB_API_TOKEN}`,
      'X-Client-ID': process.env.JCB_CLIENT_ID,
      'Content-Type': 'application/json',
      'User-Agent': 'freee-card-integration/1.0'
    };
  }

  private handleApiError(error: any): void {
    this.connectionStatus.errorCount++;
    
    if (error.response?.status === 429) {
      // Rate limit exceeded
      this.connectionStatus.lastError = 'API rate limit exceeded';
      throw new Error('JCB API rate limit exceeded. Please retry later.');
    } else if (error.response?.status === 401) {
      // Authentication failed
      this.connectionStatus.lastError = 'Authentication failed';
      throw new Error('JCB API authentication failed');
    } else if (error.response?.status >= 500) {
      // JCB server error
      this.connectionStatus.lastError = 'JCB server error';
      throw new Error('JCB server is temporarily unavailable');
    } else {
      this.connectionStatus.lastError = error.message;
      throw error;
    }
  }

  private verifyJcbWebhookSignature(event: WebhookEvent): boolean {
    // JCB webhook 서명 검증 로직
    // HMAC-SHA256으로 서명 확인
    const expectedSignature = this.calculateJcbSignature(event);
    return event.signature === expectedSignature;
  }

  private calculateJcbSignature(event: WebhookEvent): string {
    // JCB webhook 서명 계산
    // 실제로는 crypto 모듈을 사용하여 HMAC 계산
    return 'mock_signature';
  }

  private async processJcbTransactionWebhook(event: WebhookEvent): Promise<void> {
    const transaction = event.data;
    
    // freee 시스템에 거래 정보 저장
    await this.saveTransactionToFreee(transaction);
    
    // 회계 연동 (비동기)
    this.syncToFreeeAccountingAsync(transaction);
    
    // 예산 체크 및 알림
    await this.checkBudgetAndNotify(transaction);
  }

  private async processJcbCardStatusWebhook(event: WebhookEvent): Promise<void> {
    const cardStatus = event.data;
    
    // freee 시스템의 카드 상태 동기화
    await this.syncCardStatusToFreee(cardStatus);
    
    // 관리자에게 알림 발송
    await this.notifyCardStatusChange(cardStatus);
  }

  private mapJcbCardToCardInfo(jcbCard: any): CardInfo {
    return {
      externalCardId: jcbCard.card_id,
      cardNumberMasked: this.maskCardNumber(jcbCard.card_number),
      cardHolderName: jcbCard.holder_name,
      expiryDate: `${jcbCard.expiry_month}/${jcbCard.expiry_year.toString().slice(-2)}`,
      cardType: jcbCard.card_type,
      status: this.mapJcbStatusToStandard(jcbCard.status)
    };
  }

  private mapJcbTransactionToTransactionData(jcbTransaction: any): TransactionData {
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

  private maskCardNumber(cardNumber: string): string {
    // JCB 카드번호 마스킹 (처음 4자리와 마지막 4자리만 표시)
    if (cardNumber.length < 8) return cardNumber;
    const first4 = cardNumber.slice(0, 4);
    const last4 = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 8);
    return `${first4}${masked}${last4}`;
  }

  private mapJcbStatusToStandard(jcbStatus: string): string {
    const statusMap: Record<string, string> = {
      'active': 'active',
      'suspended': 'suspended', 
      'blocked': 'suspended',
      'expired': 'expired',
      'cancelled': 'cancelled'
    };
    return statusMap[jcbStatus] || 'unknown';
  }

  private async saveTransactionToFreee(transaction: any): Promise<void> {
    // freee 데이터베이스에 거래 정보 저장
  }

  private async syncToFreeeAccountingAsync(transaction: any): Promise<void> {
    // 비동기로 freee 회계 연동 처리
  }

  private async checkBudgetAndNotify(transaction: any): Promise<void> {
    // 예산 초과 체크 및 알림
  }

  private async syncCardStatusToFreee(cardStatus: any): Promise<void> {
    // freee 시스템의 카드 상태 업데이트
  }

  private async notifyCardStatusChange(cardStatus: any): Promise<void> {
    // 카드 상태 변경 알림 발송
  }
}