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
exports.TransactionController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const transaction_service_1 = require("../services/transaction.service");
const transaction_dto_1 = require("../dto/transaction.dto");
let TransactionController = class TransactionController {
    constructor(transactionService) {
        this.transactionService = transactionService;
    }
    async listTransactions(filter) {
        return this.transactionService.findWithFilter(filter);
    }
    async getTransaction(transactionId) {
        return this.transactionService.findById(transactionId);
    }
    async createTransaction(createTransactionDto) {
        return this.transactionService.createTransaction(createTransactionDto);
    }
    async updateTransaction(transactionId, updateTransactionDto) {
        return this.transactionService.updateTransaction(transactionId, updateTransactionDto);
    }
    async completeTransaction(transactionId) {
        return this.transactionService.completeTransaction(transactionId);
    }
    async failTransaction(transactionId) {
        return this.transactionService.failTransaction(transactionId);
    }
    async cancelTransaction(transactionId) {
        return this.transactionService.cancelTransaction(transactionId);
    }
};
exports.TransactionController = TransactionController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all transactions with pagination and filtering' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Paginated list of transactions', type: transaction_dto_1.PaginatedTransactionResponseDto }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_dto_1.TransactionFilterDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)(':transactionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction by ID' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction details', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new transaction' }),
    (0, swagger_1.ApiBody)({ type: transaction_dto_1.CreateTransactionDto }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Transaction created successfully', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid request or insufficient balance' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Card not found' }),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [transaction_dto_1.CreateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Patch)(':transactionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update transaction (category, memo)' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID', type: 'string' }),
    (0, swagger_1.ApiBody)({ type: transaction_dto_1.UpdateTransactionDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction updated successfully', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, transaction_dto_1.UpdateTransactionDto]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Post)(':transactionId/complete'),
    (0, swagger_1.ApiOperation)({ summary: 'Complete a pending transaction' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction completed successfully', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transaction cannot be completed' }),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "completeTransaction", null);
__decorate([
    (0, common_1.Post)(':transactionId/fail'),
    (0, swagger_1.ApiOperation)({ summary: 'Fail a pending transaction' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction failed successfully', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transaction cannot be failed' }),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "failTransaction", null);
__decorate([
    (0, common_1.Post)(':transactionId/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a transaction' }),
    (0, swagger_1.ApiParam)({ name: 'transactionId', description: 'Transaction ID', type: 'string' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction cancelled successfully', type: transaction_dto_1.TransactionResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Transaction cannot be cancelled' }),
    __param(0, (0, common_1.Param)('transactionId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TransactionController.prototype, "cancelTransaction", null);
exports.TransactionController = TransactionController = __decorate([
    (0, swagger_1.ApiTags)('transactions'),
    (0, common_1.Controller)('transactions'),
    __metadata("design:paramtypes", [transaction_service_1.TransactionService])
], TransactionController);
//# sourceMappingURL=transaction.controller.js.map