import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BusinessCard } from '../business-card/business-card.entity';

export enum CardProviderType {
  FREEE_NATIVE = 'freee-native',    // freee 자체 발급 카드
  PARTNER = 'partner',              // 제휴 카드 (JCB, VISA 등)
  EXTERNAL = 'external'             // 외부 카드 연동
}

export enum CardProviderStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEPRECATED = 'deprecated'
}

@Entity('card_providers')
export class CardProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // JCB, VISA, Mastercard, AMEX, freee

  @Column()
  displayName: string; // 일본어 표시명

  @Column({
    type: 'enum',
    enum: CardProviderType,
  })
  type: CardProviderType;

  @Column({
    type: 'enum',
    enum: CardProviderStatus,
    default: CardProviderStatus.ACTIVE,
  })
  status: CardProviderStatus;

  // 기술 스펙
  @Column({ name: 'real_time_sync', default: false })
  realTimeSync: boolean;

  @Column({ name: 'data_accuracy', type: 'decimal', precision: 3, scale: 2 })
  dataAccuracy: number; // 0.70 ~ 1.00

  @Column({ name: 'sync_interval_minutes', nullable: true })
  syncIntervalMinutes?: number; // null이면 실시간, 아니면 배치 간격

  // API 설정
  @Column({ name: 'api_endpoint', nullable: true })
  apiEndpoint?: string;

  @Column({ name: 'webhook_url', nullable: true })
  webhookUrl?: string;

  @Column({ name: 'requires_manual_sync', default: false })
  requiresManualSync: boolean;

  // 비즈니스 설정
  @Column({ name: 'revenue_share_rate', type: 'decimal', precision: 5, scale: 4 })
  revenueShareRate: number; // freee가 받는 수수료 비율

  @Column({ name: 'customer_acquisition_cost', type: 'int', default: 0 })
  customerAcquisitionCost: number; // 고객 유치 비용

  @Column({ name: 'processing_fee', type: 'int', default: 0 })
  processingFee: number; // 거래당 처리 수수료

  @OneToMany(() => BusinessCard, card => card.provider)
  cards: BusinessCard[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 비즈니스 메서드
  isRealTime(): boolean {
    return this.realTimeSync && this.type === CardProviderType.FREEE_NATIVE;
  }

  getExpectedSyncDelay(): number {
    if (this.realTimeSync) return 0;
    return this.syncIntervalMinutes || 1440; // 기본 24시간
  }

  calculateRevenue(transactionAmount: number): number {
    return Math.round(transactionAmount * this.revenueShareRate);
  }

  isHighPriority(): boolean {
    return this.type === CardProviderType.FREEE_NATIVE || this.dataAccuracy >= 0.9;
  }
}