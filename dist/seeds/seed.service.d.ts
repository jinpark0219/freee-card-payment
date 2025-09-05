import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
import { CardTransaction } from '../entities/card-transaction.entity';
export declare class SeedService {
    private cardRepository;
    private transactionRepository;
    constructor(cardRepository: Repository<Card>, transactionRepository: Repository<CardTransaction>);
    seed(): Promise<void>;
    private createSampleCards;
    private createSampleTransactions;
}
