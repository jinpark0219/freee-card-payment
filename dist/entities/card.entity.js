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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Card = exports.CardStatus = exports.CardBrand = void 0;
const typeorm_1 = require("typeorm");
const card_transaction_entity_1 = require("./card-transaction.entity");
var CardBrand;
(function (CardBrand) {
    CardBrand["VISA"] = "visa";
    CardBrand["MASTERCARD"] = "mastercard";
    CardBrand["JCB"] = "jcb";
    CardBrand["AMEX"] = "amex";
})(CardBrand || (exports.CardBrand = CardBrand = {}));
var CardStatus;
(function (CardStatus) {
    CardStatus["ACTIVE"] = "active";
    CardStatus["SUSPENDED"] = "suspended";
    CardStatus["CANCELLED"] = "cancelled";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
let Card = class Card {
    suspend() {
        if (this.status === CardStatus.CANCELLED) {
            throw new Error('Card is already cancelled');
        }
        this.status = CardStatus.SUSPENDED;
    }
    activate() {
        if (this.status === CardStatus.CANCELLED) {
            throw new Error('Card is already cancelled');
        }
        if (this.status === CardStatus.ACTIVE) {
            throw new Error('Card is already active');
        }
        this.status = CardStatus.ACTIVE;
    }
    cancel() {
        if (this.status === CardStatus.CANCELLED) {
            throw new Error('Card is already cancelled');
        }
        this.status = CardStatus.CANCELLED;
    }
    updateBalance(newBalance) {
        this.availableBalance = newBalance;
    }
    hasInsufficientBalance(amount) {
        return this.availableBalance < amount;
    }
};
exports.Card = Card;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Card.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cardholder_name' }),
    __metadata("design:type", String)
], Card.prototype, "cardholderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_four', length: 4 }),
    __metadata("design:type", String)
], Card.prototype, "lastFour", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CardBrand,
    }),
    __metadata("design:type", String)
], Card.prototype, "brand", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', length: 5 }),
    __metadata("design:type", String)
], Card.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: CardStatus,
        default: CardStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Card.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], Card.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'credit_limit', type: 'int' }),
    __metadata("design:type", Number)
], Card.prototype, "creditLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_balance', type: 'int' }),
    __metadata("design:type", Number)
], Card.prototype, "availableBalance", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => card_transaction_entity_1.CardTransaction, transaction => transaction.card),
    __metadata("design:type", Array)
], Card.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Card.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Card.prototype, "updatedAt", void 0);
exports.Card = Card = __decorate([
    (0, typeorm_1.Entity)('cards')
], Card);
//# sourceMappingURL=card.entity.js.map