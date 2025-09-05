import { Repository } from 'typeorm';
import { Card } from '../entities/card.entity';
export declare class CardService {
    private cardRepository;
    constructor(cardRepository: Repository<Card>);
    findById(cardId: string): Promise<Card>;
    findByUserId(userId: string): Promise<Card[]>;
    suspendCard(cardId: string): Promise<Card>;
    activateCard(cardId: string): Promise<Card>;
    cancelCard(cardId: string): Promise<Card>;
    updateBalance(cardId: string, newBalance: number): Promise<Card>;
    isCardActive(cardId: string): Promise<boolean>;
    hasInsufficientBalance(cardId: string, amount: number): Promise<boolean>;
}
