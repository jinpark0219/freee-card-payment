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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const card_entity_1 = require("../entities/card.entity");
const card_transaction_entity_1 = require("../entities/card-transaction.entity");
let SeedService = class SeedService {
    constructor(cardRepository, transactionRepository) {
        this.cardRepository = cardRepository;
        this.transactionRepository = transactionRepository;
    }
    async seed() {
        const existingTransactions = await this.transactionRepository.find();
        if (existingTransactions.length > 0) {
            await this.transactionRepository.remove(existingTransactions);
        }
        const existingCards = await this.cardRepository.find();
        if (existingCards.length > 0) {
            await this.cardRepository.remove(existingCards);
        }
        const cards = await this.createSampleCards();
        await this.createSampleTransactions(cards);
        console.log('✅ Seed data created successfully!');
    }
    async createSampleCards() {
        const sampleCards = [
            {
                cardholderName: '김철수',
                lastFour: '1234',
                brand: card_entity_1.CardBrand.VISA,
                expiryDate: '12/25',
                status: card_entity_1.CardStatus.ACTIVE,
                userId: 'user-001',
                creditLimit: 1000000,
                availableBalance: 800000,
            },
            {
                cardholderName: '이영희',
                lastFour: '5678',
                brand: card_entity_1.CardBrand.MASTERCARD,
                expiryDate: '06/26',
                status: card_entity_1.CardStatus.ACTIVE,
                userId: 'user-002',
                creditLimit: 1500000,
                availableBalance: 1200000,
            },
            {
                cardholderName: '박민수',
                lastFour: '9012',
                brand: card_entity_1.CardBrand.JCB,
                expiryDate: '03/27',
                status: card_entity_1.CardStatus.SUSPENDED,
                userId: 'user-003',
                creditLimit: 800000,
                availableBalance: 600000,
            },
            {
                cardholderName: '최지영',
                lastFour: '3456',
                brand: card_entity_1.CardBrand.AMEX,
                expiryDate: '09/25',
                status: card_entity_1.CardStatus.ACTIVE,
                userId: 'user-004',
                creditLimit: 2000000,
                availableBalance: 1800000,
            },
        ];
        const cards = [];
        for (const cardData of sampleCards) {
            const card = this.cardRepository.create(cardData);
            const savedCard = await this.cardRepository.save(card);
            cards.push(savedCard);
        }
        return cards;
    }
    async createSampleTransactions(cards) {
        const sampleTransactions = [
            {
                amount: 50000,
                merchantName: '스타벅스 강남점',
                transactionDate: new Date('2025-09-01T09:30:00'),
                cardLastFour: cards[0].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[0].userId,
                cardId: cards[0].id,
                category: '식비',
                memo: '팀 회의 커피',
            },
            {
                amount: 120000,
                merchantName: '롯데마트',
                transactionDate: new Date('2025-09-02T14:20:00'),
                cardLastFour: cards[0].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[0].userId,
                cardId: cards[0].id,
                category: '생활용품',
                memo: '생필품 구매',
            },
            {
                amount: 30000,
                merchantName: 'GS25 편의점',
                transactionDate: new Date('2025-09-03T19:15:00'),
                cardLastFour: cards[0].lastFour,
                status: card_transaction_entity_1.TransactionStatus.PENDING,
                userId: cards[0].userId,
                cardId: cards[0].id,
                category: '식비',
            },
            {
                amount: 80000,
                merchantName: '교보문고',
                transactionDate: new Date('2025-09-01T11:00:00'),
                cardLastFour: cards[1].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[1].userId,
                cardId: cards[1].id,
                category: '도서',
                memo: '개발 서적 구매',
            },
            {
                amount: 200000,
                merchantName: '신세계백화점',
                transactionDate: new Date('2025-09-04T16:30:00'),
                cardLastFour: cards[1].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[1].userId,
                cardId: cards[1].id,
                category: '의류',
                memo: '가을 옷 구매',
            },
            {
                amount: 100000,
                merchantName: 'CGV 영화관',
                transactionDate: new Date('2025-09-05T20:00:00'),
                cardLastFour: cards[1].lastFour,
                status: card_transaction_entity_1.TransactionStatus.FAILED,
                userId: cards[1].userId,
                cardId: cards[1].id,
                category: '엔터테인먼트',
                memo: '영화 티켓 결제 실패',
            },
            {
                amount: 150000,
                merchantName: '현대자동차',
                transactionDate: new Date('2025-08-30T10:00:00'),
                cardLastFour: cards[2].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[2].userId,
                cardId: cards[2].id,
                category: '차량정비',
                memo: '정기점검',
            },
            {
                amount: 60000,
                merchantName: '올리브영',
                transactionDate: new Date('2025-09-01T15:45:00'),
                cardLastFour: cards[2].lastFour,
                status: card_transaction_entity_1.TransactionStatus.CANCELLED,
                userId: cards[2].userId,
                cardId: cards[2].id,
                category: '생활용품',
                memo: '주문 취소',
            },
            {
                amount: 45000,
                merchantName: '애플스토어',
                transactionDate: new Date('2025-09-03T13:20:00'),
                cardLastFour: cards[3].lastFour,
                status: card_transaction_entity_1.TransactionStatus.COMPLETED,
                userId: cards[3].userId,
                cardId: cards[3].id,
                category: '전자제품',
                memo: 'AirPods 케이스',
            },
            {
                amount: 25000,
                merchantName: '투썸플레이스',
                transactionDate: new Date('2025-09-05T14:10:00'),
                cardLastFour: cards[3].lastFour,
                status: card_transaction_entity_1.TransactionStatus.PENDING,
                userId: cards[3].userId,
                cardId: cards[3].id,
                category: '식비',
                memo: '브런치',
            },
        ];
        for (const transactionData of sampleTransactions) {
            const transaction = this.transactionRepository.create(transactionData);
            await this.transactionRepository.save(transaction);
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __param(1, (0, typeorm_1.InjectRepository)(card_transaction_entity_1.CardTransaction)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SeedService);
//# sourceMappingURL=seed.service.js.map