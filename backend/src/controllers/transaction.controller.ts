import { Controller, Get, Post, Patch, Param, Query, Body, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { TransactionService, PaginatedTransactions } from '../services/transaction.service';
import { 
  CreateTransactionDto, 
  UpdateTransactionDto, 
  TransactionFilterDto, 
  TransactionResponseDto,
  PaginatedTransactionResponseDto 
} from '../dto/transaction.dto';
import { CardTransaction } from '../entities/card-transaction.entity';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get()
  @ApiOperation({ summary: 'List all transactions with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Paginated list of transactions', type: PaginatedTransactionResponseDto })
  async listTransactions(@Query() filter: TransactionFilterDto): Promise<PaginatedTransactions> {
    return this.transactionService.findWithFilter(filter);
  }

  @Get(':transactionId')
  @ApiOperation({ summary: 'Get transaction by ID' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Transaction details', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Param('transactionId', ParseUUIDPipe) transactionId: string): Promise<CardTransaction> {
    return this.transactionService.findById(transactionId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction created successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid request or insufficient balance' })
  @ApiResponse({ status: 404, description: 'Card not found' })
  @HttpCode(HttpStatus.CREATED)
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto): Promise<CardTransaction> {
    return this.transactionService.createTransaction(createTransactionDto);
  }

  @Patch(':transactionId')
  @ApiOperation({ summary: 'Update transaction (category, memo)' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: 'string' })
  @ApiBody({ type: UpdateTransactionDto })
  @ApiResponse({ status: 200, description: 'Transaction updated successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async updateTransaction(
    @Param('transactionId', ParseUUIDPipe) transactionId: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ): Promise<CardTransaction> {
    return this.transactionService.updateTransaction(transactionId, updateTransactionDto);
  }

  @Post(':transactionId/complete')
  @ApiOperation({ summary: 'Complete a pending transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Transaction completed successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Transaction cannot be completed' })
  async completeTransaction(@Param('transactionId', ParseUUIDPipe) transactionId: string): Promise<CardTransaction> {
    return this.transactionService.completeTransaction(transactionId);
  }

  @Post(':transactionId/fail')
  @ApiOperation({ summary: 'Fail a pending transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Transaction failed successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Transaction cannot be failed' })
  async failTransaction(@Param('transactionId', ParseUUIDPipe) transactionId: string): Promise<CardTransaction> {
    return this.transactionService.failTransaction(transactionId);
  }

  @Post(':transactionId/cancel')
  @ApiOperation({ summary: 'Cancel a transaction' })
  @ApiParam({ name: 'transactionId', description: 'Transaction ID', type: 'string' })
  @ApiResponse({ status: 200, description: 'Transaction cancelled successfully', type: TransactionResponseDto })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  @ApiResponse({ status: 400, description: 'Transaction cannot be cancelled' })
  async cancelTransaction(@Param('transactionId', ParseUUIDPipe) transactionId: string): Promise<CardTransaction> {
    return this.transactionService.cancelTransaction(transactionId);
  }
}