import { Repository } from 'typeorm';
import { CardTransaction } from '../entities/card-transaction.entity';
import { CardService } from './card.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../dto/transaction.dto';
export interface PaginatedTransactions {
    transactions: CardTransaction[];
    totalCount: number;
}
export declare class TransactionService {
    private transactionRepository;
    private cardService;
    constructor(transactionRepository: Repository<CardTransaction>, cardService: CardService);
    findById(transactionId: string): Promise<CardTransaction>;
    findWithFilter(filter: TransactionFilterDto): Promise<PaginatedTransactions>;
    createTransaction(createTransactionDto: CreateTransactionDto): Promise<CardTransaction>;
    updateTransaction(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<CardTransaction>;
    completeTransaction(transactionId: string): Promise<CardTransaction>;
    failTransaction(transactionId: string): Promise<CardTransaction>;
    cancelTransaction(transactionId: string): Promise<CardTransaction>;
}
