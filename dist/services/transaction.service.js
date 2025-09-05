"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const card_transaction_entity_1 = require("../entities/card-transaction.entity");
const card_service_1 = require("./card.service");
let TransactionService = class TransactionService {
    constructor(transactionRepository, cardService) {
        this.transactionRepository = transactionRepository;
        this.cardService = cardService;
    }
    async findById(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { id: transactionId },
            relations: ['card'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async findWithFilter(filter) {
        const { userId, status, fromDate, toDate, limit = 20, offset = 0 } = filter;
        const whereCondition = {};
        if (userId) {
            whereCondition.userId = userId;
        }
        if (status) {
            whereCondition.status = status;
        }
        if (fromDate && toDate) {
            whereCondition.transactionDate = (0, typeorm_2.Between)(fromDate, toDate);
        }
        else if (fromDate) {
            whereCondition.transactionDate = (0, typeorm_2.MoreThanOrEqual)(fromDate);
        }
        else if (toDate) {
            whereCondition.transactionDate = (0, typeorm_2.LessThanOrEqual)(toDate);
        }
        const findOptions = {
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
    async createTransaction(createTransactionDto) {
        const { amount, merchantName, transactionDate, cardId } = createTransactionDto;
        const card = await this.cardService.findById(cardId);
        if (!await this.cardService.isCardActive(cardId)) {
            throw new common_1.BadRequestException('Card is not active');
        }
        if (await this.cardService.hasInsufficientBalance(cardId, amount)) {
            throw new common_1.BadRequestException('Insufficient balance');
        }
        const transaction = this.transactionRepository.create({
            amount,
            merchantName,
            transactionDate,
            cardLastFour: card.lastFour,
            userId: card.userId,
            cardId,
            status: card_transaction_entity_1.TransactionStatus.PENDING,
        });
        const savedTransaction = await this.transactionRepository.save(transaction);
        await this.cardService.updateBalance(cardId, card.availableBalance - amount);
        return savedTransaction;
    }
    async updateTransaction(transactionId, updateTransactionDto) {
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
    async completeTransaction(transactionId) {
        const transaction = await this.findById(transactionId);
        transaction.complete();
        return this.transactionRepository.save(transaction);
    }
    async failTransaction(transactionId) {
        const transaction = await this.findById(transactionId);
        transaction.fail();
        return this.transactionRepository.save(transaction);
    }
    async cancelTransaction(transactionId) {
        const transaction = await this.findById(transactionId);
        transaction.cancel();
        return this.transactionRepository.save(transaction);
    }
};
exports.TransactionService = TransactionService;
exports.TransactionService = TransactionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(card_transaction_entity_1.CardTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        card_service_1.CardService])
], TransactionService);
//# sourceMappingURL=transaction.service.js.map