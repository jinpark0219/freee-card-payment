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

/**
 * 카드 제공업체별 통합 인터페이스
 * freee 자체 카드, 제휴 카드, 외부 카드 모두 이 인터페이스로 통일
 */
export interface CardGateway {
  readonly providerType: CardProviderType;
  readonly providerId: string;
  readonly supportsRealTime: boolean;
  readonly supportsWebhook: boolean;

  // 카드 관리
  getCards(companyId: string): Promise<CardInfo[]>;
  getCardDetails(cardId: string): Promise<CardInfo>;
  
  // 거래 조회
  getTransactions(
    cardId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<TransactionData[]>;
  
  getTransaction(transactionId: string): Promise<TransactionData>;

  // 결제 처리 (freee 자체 카드만 지원)
  processPayment?(request: PaymentRequest): Promise<PaymentResult>;
  
  // 카드 제어 (freee 자체 카드, 일부 제휴 카드)
  suspendCard?(cardId: string): Promise<boolean>;
  activateCard?(cardId: string): Promise<boolean>;
  updateCardLimits?(cardId: string, limits: CardLimits): Promise<boolean>;

  // 실시간 연동 (webhook 지원 업체만)
  handleWebhook?(event: WebhookEvent): Promise<void>;
  
  // 상태 확인
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

/**
 * 게이트웨이 팩토리
 */
export interface CardGatewayFactory {
  createGateway(providerType: CardProviderType, config: any): CardGateway;
  getSupportedProviders(): CardProviderType[];
}