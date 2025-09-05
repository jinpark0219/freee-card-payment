import { TransactionService, PaginatedTransactions } from '../services/transaction.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../dto/transaction.dto';
import { CardTransaction } from '../entities/card-transaction.entity';
export declare class TransactionController {
    private readonly transactionService;
    constructor(transactionService: TransactionService);
    listTransactions(filter: TransactionFilterDto): Promise<PaginatedTransactions>;
    getTransaction(transactionId: string): Promise<CardTransaction>;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<CardTransaction>;
    updateTransaction(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<CardTransaction>;
    completeTransaction(transactionId: string): Promise<CardTransaction>;
    failTransaction(transactionId: string): Promise<CardTransaction>;
    cancelTransaction(transactionId: string): Promise<CardTransaction>;
}
