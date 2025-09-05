import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { BusinessCard } from '../domains/business-card/business-card.entity';

export enum CompanySize {
  SMALL = 'small',       // 1-50명
  MEDIUM = 'medium',     // 51-300명
  LARGE = 'large',       // 300명 이상
}

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // 회사명

  @Column({ name: 'name_kana', nullable: true })
  nameKana?: string; // 회사명 가타카나

  @Column({ name: 'registration_number' })
  registrationNumber: string; // 법인등록번호

  @Column({ name: 'tax_id' })
  taxId: string; // 세금 ID

  @Column({
    type: 'enum',
    enum: CompanySize,
    default: CompanySize.SMALL,
  })
  size: CompanySize;

  @Column()
  industry: string; // 업종

  @Column({ name: 'fiscal_year_start_month', default: 4 })
  fiscalYearStartMonth: number; // 회계연도 시작월 (일본은 보통 4월)

  @Column({ name: 'monthly_budget', type: 'bigint', nullable: true })
  monthlyBudget?: number; // 월 예산

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @OneToMany(() => BusinessCard, card => card.company)
  cards: BusinessCard[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}