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
exports.PaginatedTransactionResponseDto = exports.TransactionResponseDto = exports.TransactionFilterDto = exports.UpdateTransactionDto = exports.CreateTransactionDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const swagger_1 = require("@nestjs/swagger");
const card_transaction_entity_1 = require("../entities/card-transaction.entity");
class CreateTransactionDto {
}
exports.CreateTransactionDto = CreateTransactionDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount in JPY', minimum: 1 }),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsPositive)(),
    __metadata("design:type", Number)
], CreateTransactionDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Merchant name' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    __metadata("design:type", Date)
], CreateTransactionDto.prototype, "transactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card ID' }),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateTransactionDto.prototype, "cardId", void 0);
class UpdateTransactionDto {
}
exports.UpdateTransactionDto = UpdateTransactionDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expense category' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction memo' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateTransactionDto.prototype, "memo", void 0);
class TransactionFilterDto {
    constructor() {
        this.limit = 20;
        this.offset = 0;
    }
}
exports.TransactionFilterDto = TransactionFilterDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'User ID' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: card_transaction_entity_1.TransactionStatus, description: 'Transaction status' }),
    (0, class_validator_1.IsEnum)(card_transaction_entity_1.TransactionStatus),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], TransactionFilterDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Start date for filtering' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], TransactionFilterDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'End date for filtering' }),
    (0, class_validator_1.IsDate)(),
    (0, class_transformer_1.Type)(() => Date),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], TransactionFilterDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of results to return', minimum: 1, maximum: 100, default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransactionFilterDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Number of results to skip', minimum: 0, default: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], TransactionFilterDto.prototype, "offset", void 0);
class TransactionResponseDto {
}
exports.TransactionResponseDto = TransactionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction ID' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction amount in JPY' }),
    __metadata("design:type", Number)
], TransactionResponseDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Merchant name' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "merchantName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Transaction date' }),
    __metadata("design:type", Date)
], TransactionResponseDto.prototype, "transactionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card last 4 digits' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "cardLastFour", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: card_transaction_entity_1.TransactionStatus, description: 'Transaction status' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'User ID' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Expense category' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Transaction memo' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "memo", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Card ID' }),
    __metadata("design:type", String)
], TransactionResponseDto.prototype, "cardId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Created timestamp' }),
    __metadata("design:type", Date)
], TransactionResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Updated timestamp' }),
    __metadata("design:type", Date)
], TransactionResponseDto.prototype, "updatedAt", void 0);
class PaginatedTransactionResponseDto {
}
exports.PaginatedTransactionResponseDto = PaginatedTransactionResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TransactionResponseDto], description: 'List of transactions' }),
    __metadata("design:type", Array)
], PaginatedTransactionResponseDto.prototype, "transactions", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Total count of transactions' }),
    __metadata("design:type", Number)
], PaginatedTransactionResponseDto.prototype, "totalCount", void 0);
//# sourceMappingURL=transaction.dto.js.map