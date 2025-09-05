import { CardTransaction } from './card-transaction.entity';
export declare enum CardBrand {
    VISA = "visa",
    MASTERCARD = "mastercard",
    JCB = "jcb",
    AMEX = "amex"
}
export declare enum CardStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    CANCELLED = "cancelled"
}
export declare class Card {
    id: string;
    cardholderName: string;
    lastFour: string;
    brand: CardBrand;
    expiryDate: string;
    status: CardStatus;
    userId: string;
    creditLimit: number;
    availableBalance: number;
    transactions: CardTransaction[];
    createdAt: Date;
    updatedAt: Date;
    suspend(): void;
    activate(): void;
    cancel(): void;
    updateBalance(newBalance: number): void;
    hasInsufficientBalance(amount: number): boolean;
}
