import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card, CardStatus } from '../entities/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private cardRepository: Repository<Card>,
  ) {}

  async findById(cardId: string): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id: cardId },
      relations: ['transactions'],
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  async findByUserId(userId: string): Promise<Card[]> {
    return this.cardRepository.find({
      where: { userId },
      relations: ['transactions'],
    });
  }

  async suspendCard(cardId: string): Promise<Card> {
    const card = await this.findById(cardId);
    
    card.suspend();
    
    return this.cardRepository.save(card);
  }

  async activateCard(cardId: string): Promise<Card> {
    const card = await this.findById(cardId);
    
    card.activate();
    
    return this.cardRepository.save(card);
  }

  async cancelCard(cardId: string): Promise<Card> {
    const card = await this.findById(cardId);
    
    card.cancel();
    
    return this.cardRepository.save(card);
  }

  async updateBalance(cardId: string, newBalance: number): Promise<Card> {
    const card = await this.findById(cardId);
    
    card.updateBalance(newBalance);
    
    return this.cardRepository.save(card);
  }

  async isCardActive(cardId: string): Promise<boolean> {
    const card = await this.findById(cardId);
    return card.status === CardStatus.ACTIVE;
  }

  async hasInsufficientBalance(cardId: string, amount: number): Promise<boolean> {
    const card = await this.findById(cardId);
    return card.hasInsufficientBalance(amount);
  }
}