import { CardService } from '../services/card.service';
import { Card } from '../entities/card.entity';
export declare class CardController {
    private readonly cardService;
    constructor(cardService: CardService);
    listCards(userId: string): Promise<Card[]>;
    getCard(cardId: string): Promise<Card>;
    suspendCard(cardId: string): Promise<Card>;
    activateCard(cardId: string): Promise<Card>;
    cancelCard(cardId: string): Promise<Card>;
}
