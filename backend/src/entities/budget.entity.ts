import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

export enum BudgetStatus {
  SAFE = 'safe',
  WARNING = 'warning',
  EXCEEDED = 'exceeded'
}

export enum BudgetCategory {
  ENTERTAINMENT = 'ENTERTAINMENT',
  OFFICE_SUPPLIES = 'OFFICE_SUPPLIES', 
  TRAVEL = 'TRAVEL',
  SOFTWARE = 'SOFTWARE',
  OTHER = 'OTHER',
  MARKETING = 'MARKETING',
  UTILITIES = 'UTILITIES'
}

@Entity('budgets')
export class Budget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 7 })
  month: string; // YYYY-MM 형식

  @Column({ type: 'enum', enum: BudgetCategory })
  category: BudgetCategory;

  @Column({ type: 'varchar', length: 100 })
  categoryNameKo: string;

  @Column({ type: 'bigint' })
  budgetAmount: number;

  @Column({ type: 'bigint', default: 0 })
  usedAmount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  percentage: number;

  @Column({ type: 'enum', enum: BudgetStatus, default: BudgetStatus.SAFE })
  status: BudgetStatus;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'companyId' })
  company: Company;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}