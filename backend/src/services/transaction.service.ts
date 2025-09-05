import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CardTransaction, TransactionStatus } from '../entities/card-transaction.entity';
import { CardService } from './card.service';
import { CreateTransactionDto, UpdateTransactionDto, TransactionFilterDto } from '../dto/transaction.dto';

export interface PaginatedTransactions {
  transactions: CardTransaction[];
  totalCount: number;
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(CardTransaction)
    private transactionRepository: Repository<CardTransaction>,
    private cardService: CardService,
  ) {}

  async findById(transactionId: string): Promise<CardTransaction> {
    const transaction = await this.transactionRepository.findOne({
      where: { id: transactionId },
      relations: ['card'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  async findWithFilter(filter: TransactionFilterDto): Promise<PaginatedTransactions> {
    const { userId, status, fromDate, toDate, limit = 20, offset = 0 } = filter;

    const whereCondition: any = {};

    if (userId) {
      whereCondition.userId = userId;
    }

    if (status) {
      whereCondition.status = status;
    }

    if (fromDate && toDate) {
      whereCondition.transactionDate = Between(fromDate, toDate);
    } else if (fromDate) {
      whereCondition.transactionDate = MoreThanOrEqual(fromDate);
    } else if (toDate) {
      whereCondition.transactionDate = LessThanOrEqual(toDate);
    }

    const findOptions: FindManyOptions<CardTransaction> = {
      where: whereCondition,
      relations: ['card'],
      take: limit,
      skip: offset,
      order: {
        transactionDate: 'DESC',
      },
    };

    const [transactions, totalCount] = await this.transactionRepository.findAndCount(findOptions);

    return {
      transactions,
      totalCount,
    };
  }

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<CardTransaction> {
    const { amount, merchantName, transactionDate, cardId } = createTransactionDto;

    const card = await this.cardService.findById(cardId);

    if (!await this.cardService.isCardActive(cardId)) {
      throw new BadRequestException('Card is not active');
    }

    if (await this.cardService.hasInsufficientBalance(cardId, amount)) {
      throw new BadRequestException('Insufficient balance');
    }

    const transaction = this.transactionRepository.create({
      amount,
      merchantName,
      transactionDate,
      cardLastFour: card.lastFour,
      userId: card.userId,
      cardId,
      status: TransactionStatus.PENDING,
    });

    const savedTransaction = await this.transactionRepository.save(transaction);

    await this.cardService.updateBalance(cardId, card.availableBalance - amount);

    return savedTransaction;
  }

  async updateTransaction(transactionId: string, updateTransactionDto: UpdateTransactionDto): Promise<CardTransaction> {
    const transaction = await this.findById(transactionId);
    const { category, memo } = updateTransactionDto;

    if (category !== undefined) {
      transaction.updateCategory(category);
    }

    if (memo !== undefined) {
      transaction.updateMemo(memo);
    }

    return this.transactionRepository.save(transaction);
  }

  async completeTransaction(transactionId: string): Promise<CardTransaction> {
    const transaction = await this.findById(transactionId);
    
    transaction.complete();
    
    return this.transactionRepository.save(transaction);
  }

  async failTransaction(transactionId: string): Promise<CardTransaction> {
    const transaction = await this.findById(transactionId);
    
    transaction.fail();
    
    return this.transactionRepository.save(transaction);
  }

  async cancelTransaction(transactionId: string): Promise<CardTransaction> {
    const transaction = await this.findById(transactionId);
    
    transaction.cancel();
    
    return this.transactionRepository.save(transaction);
  }
}