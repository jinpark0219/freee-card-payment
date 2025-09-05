import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { CardTransaction } from './card-transaction.entity';

export enum CardBrand {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  JCB = 'jcb',
  AMEX = 'amex',
}

export enum CardStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CANCELLED = 'cancelled',
}

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cardholder_name' })
  cardholderName: string;

  @Column({ name: 'last_four', length: 4 })
  lastFour: string;

  @Column({
    type: 'enum',
    enum: CardBrand,
  })
  brand: CardBrand;

  @Column({ name: 'expiry_date', length: 5 }) // MM/YY format
  expiryDate: string;

  @Column({
    type: 'enum',
    enum: CardStatus,
    default: CardStatus.ACTIVE,
  })
  status: CardStatus;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'credit_limit', type: 'int' })
  creditLimit: number;

  @Column({ name: 'available_balance', type: 'int' })
  availableBalance: number;

  @OneToMany(() => CardTransaction, transaction => transaction.card)
  transactions: CardTransaction[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  suspend(): void {
    if (this.status === CardStatus.CANCELLED) {
      throw new Error('Card is already cancelled');
    }
    this.status = CardStatus.SUSPENDED;
  }

  activate(): void {
    if (this.status === CardStatus.CANCELLED) {
      throw new Error('Card is already cancelled');
    }
    if (this.status === CardStatus.ACTIVE) {
      throw new Error('Card is already active');
    }
    this.status = CardStatus.ACTIVE;
  }

  cancel(): void {
    if (this.status === CardStatus.CANCELLED) {
      throw new Error('Card is already cancelled');
    }
    this.status = CardStatus.CANCELLED;
  }

  updateBalance(newBalance: number): void {
    this.availableBalance = newBalance;
  }

  hasInsufficientBalance(amount: number): boolean {
    return this.availableBalance < amount;
  }
}