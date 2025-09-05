import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Company } from './company.entity';
import { BusinessCard } from '../domains/business-card/business-card.entity';

export enum EmployeeRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  EXECUTIVE = 'executive',
  ADMIN = 'admin',
}

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // 직원 이름

  @Column({ name: 'name_kana', nullable: true })
  nameKana?: string; // 이름 가타카나

  @Column({ unique: true })
  email: string;

  @Column({ name: 'employee_number' })
  employeeNumber: string; // 사번

  @Column()
  department: string; // 부서

  @Column({
    type: 'enum',
    enum: EmployeeRole,
    default: EmployeeRole.EMPLOYEE,
  })
  role: EmployeeRole;

  @Column({ name: 'company_id' })
  companyId: string;

  @ManyToOne(() => Company)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => BusinessCard, card => card.employee)
  cards: BusinessCard[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'can_approve', default: false })
  canApprove: boolean; // 승인 권한

  @Column({ name: 'approval_limit', type: 'bigint', nullable: true })
  approvalLimit?: number; // 승인 한도

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}