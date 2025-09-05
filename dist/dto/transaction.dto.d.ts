import { TransactionStatus } from '../entities/card-transaction.entity';
export declare class CreateTransactionDto {
    amount: number;
    merchantName: string;
    transactionDate: Date;
    cardId: string;
}
export declare class UpdateTransactionDto {
    category?: string;
    memo?: string;
}
export declare class TransactionFilterDto {
    userId?: string;
    status?: TransactionStatus;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
}
export declare class TransactionResponseDto {
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
    createdAt: Date;
    updatedAt: Date;
}
export declare class PaginatedTransactionResponseDto {
    transactions: TransactionResponseDto[];
    totalCount: number;
}
