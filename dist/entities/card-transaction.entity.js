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
exports.CardTransaction = exports.TransactionStatus = void 0;
const typeorm_1 = require("typeorm");
const card_entity_1 = require("./card.entity");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let CardTransaction = class CardTransaction {
    complete() {
        if (this.status !== TransactionStatus.PENDING) {
            throw new Error('Invalid transaction status');
        }
        this.status = TransactionStatus.COMPLETED;
    }
    fail() {
        if (this.status !== TransactionStatus.PENDING) {
            throw new Error('Invalid transaction status');
        }
        this.status = TransactionStatus.FAILED;
    }
    cancel() {
        if (this.status === TransactionStatus.COMPLETED) {
            throw new Error('Cannot cancel completed transaction');
        }
        this.status = TransactionStatus.CANCELLED;
    }
    updateCategory(category) {
        this.category = category;
    }
    updateMemo(memo) {
        this.memo = memo;
    }
    isPending() {
        return this.status === TransactionStatus.PENDING;
    }
    isCompleted() {
        return this.status === TransactionStatus.COMPLETED;
    }
};
exports.CardTransaction = CardTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CardTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CardTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'merchant_name' }),
    __metadata("design:type", String)
], CardTransaction.prototype, "merchantName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'transaction_date' }),
    __metadata("design:type", Date)
], CardTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_last_four', length: 4 }),
    __metadata("design:type", String)
], CardTransaction.prototype, "cardLastFour", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], CardTransaction.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id' }),
    __metadata("design:type", String)
], CardTransaction.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CardTransaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CardTransaction.prototype, "memo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'card_id' }),
    __metadata("design:type", String)
], CardTransaction.prototype, "cardId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => card_entity_1.Card, card => card.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'card_id' }),
    __metadata("design:type", card_entity_1.Card)
], CardTransaction.prototype, "card", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CardTransaction.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CardTransaction.prototype, "updatedAt", void 0);
exports.CardTransaction = CardTransaction = __decorate([
    (0, typeorm_1.Entity)('card_transactions')
], CardTransaction);
//# sourceMappingURL=card-transaction.entity.js.map