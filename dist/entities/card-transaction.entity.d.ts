import { Card } from './card.entity';
export declare enum TransactionStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class CardTransaction {
    id: string;
    amount: number;
    merchantName: string;
    transactionDate: Date;
    cardLastFour: string;
    status: TransactionStatus;
    userId: string;
    category?: string;
    memo?: string;
    cardId: string;
    card: Card;
    createdAt: Date;
    updatedAt: Date;
    complete(): void;
    fail(): void;
    cancel(): void;
    updateCategory(category: string): void;
    updateMemo(memo: string): void;
    isPending(): boolean;
    isCompleted(): boolean;
}
