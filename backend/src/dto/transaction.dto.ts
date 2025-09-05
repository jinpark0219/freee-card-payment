import { IsString, IsNumber, IsDate, IsOptional, IsEnum, IsUUID, Min, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TransactionStatus } from '../entities/card-transaction.entity';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Transaction amount in JPY', minimum: 1 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({ description: 'Merchant name' })
  @IsString()
  merchantName: string;

  @ApiProperty({ description: 'Transaction date' })
  @IsDate()
  @Type(() => Date)
  transactionDate: Date;

  @ApiProperty({ description: 'Card ID' })
  @IsUUID()
  cardId: string;
}

export class UpdateTransactionDto {
  @ApiPropertyOptional({ description: 'Expense category' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ description: 'Transaction memo' })
  @IsString()
  @IsOptional()
  memo?: string;
}

export class TransactionFilterDto {
  @ApiPropertyOptional({ description: 'User ID' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiPropertyOptional({ enum: TransactionStatus, description: 'Transaction status' })
  @IsEnum(TransactionStatus)
  @IsOptional()
  status?: TransactionStatus;

  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  fromDate?: Date;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  toDate?: Date;

  @ApiPropertyOptional({ description: 'Number of results to return', minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Number of results to skip', minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}

export class TransactionResponseDto {
  @ApiProperty({ description: 'Transaction ID' })
  id: string;

  @ApiProperty({ description: 'Transaction amount in JPY' })
  amount: number;

  @ApiProperty({ description: 'Merchant name' })
  merchantName: string;

  @ApiProperty({ description: 'Transaction date' })
  transactionDate: Date;

  @ApiProperty({ description: 'Card last 4 digits' })
  cardLastFour: string;

  @ApiProperty({ enum: TransactionStatus, description: 'Transaction status' })
  status: TransactionStatus;

  @ApiProperty({ description: 'User ID' })
  userId: string;

  @ApiPropertyOptional({ description: 'Expense category' })
  category?: string;

  @ApiPropertyOptional({ description: 'Transaction memo' })
  memo?: string;

  @ApiProperty({ description: 'Card ID' })
  cardId: string;

  @ApiProperty({ description: 'Created timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated timestamp' })
  updatedAt: Date;
}

export class PaginatedTransactionResponseDto {
  @ApiProperty({ type: [TransactionResponseDto], description: 'List of transactions' })
  transactions: TransactionResponseDto[];

  @ApiProperty({ description: 'Total count of transactions' })
  totalCount: number;
}