import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Card } from './card.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('card_transactions')
export class CardTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ name: 'merchant_name' })
  merchantName: string;

  @Column({ name: 'transaction_date' })
  transactionDate: Date;

  @Column({ name: 'card_last_four', length: 4 })
  cardLastFour: string;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  memo?: string;

  @Column({ name: 'card_id' })
  cardId: string;

  @ManyToOne(() => Card, card => card.transactions)
  @JoinColumn({ name: 'card_id' })
  card: Card;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  complete(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Invalid transaction status');
    }
    this.status = TransactionStatus.COMPLETED;
  }

  fail(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new Error('Invalid transaction status');
    }
    this.status = TransactionStatus.FAILED;
  }

  cancel(): void {
    if (this.status === TransactionStatus.COMPLETED) {
      throw new Error('Cannot cancel completed transaction');
    }
    this.status = TransactionStatus.CANCELLED;
  }

  updateCategory(category: string): void {
    this.category = category;
  }

  updateMemo(memo: string): void {
    this.memo = memo;
  }

  isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }
}