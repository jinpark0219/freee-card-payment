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
exports.CardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const card_entity_1 = require("../entities/card.entity");
let CardService = class CardService {
    constructor(cardRepository) {
        this.cardRepository = cardRepository;
    }
    async findById(cardId) {
        const card = await this.cardRepository.findOne({
            where: { id: cardId },
            relations: ['transactions'],
        });
        if (!card) {
            throw new common_1.NotFoundException('Card not found');
        }
        return card;
    }
    async findByUserId(userId) {
        return this.cardRepository.find({
            where: { userId },
            relations: ['transactions'],
        });
    }
    async suspendCard(cardId) {
        const card = await this.findById(cardId);
        card.suspend();
        return this.cardRepository.save(card);
    }
    async activateCard(cardId) {
        const card = await this.findById(cardId);
        card.activate();
        return this.cardRepository.save(card);
    }
    async cancelCard(cardId) {
        const card = await this.findById(cardId);
        card.cancel();
        return this.cardRepository.save(card);
    }
    async updateBalance(cardId, newBalance) {
        const card = await this.findById(cardId);
        card.updateBalance(newBalance);
        return this.cardRepository.save(card);
    }
    async isCardActive(cardId) {
        const card = await this.findById(cardId);
        return card.status === card_entity_1.CardStatus.ACTIVE;
    }
    async hasInsufficientBalance(cardId, amount) {
        const card = await this.findById(cardId);
        return card.hasInsufficientBalance(amount);
    }
};
exports.CardService = CardService;
exports.CardService = CardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CardService);
//# sourceMappingURL=card.service.js.map