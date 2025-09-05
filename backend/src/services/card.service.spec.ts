import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardService } from './card.service';
import { Card } from '../entities/card.entity';

describe('CardService', () => {
  let service: CardService;
  let repository: Repository<Card>;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardService,
        {
          provide: getRepositoryToken(Card),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CardService>(CardService);
    repository = module.get<Repository<Card>>(getRepositoryToken(Card));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return cards by user ID', async () => {
    const mockCards = [
      {
        id: '1',
        cardholderName: '김철수',
        lastFour: '1234',
        brand: 'visa',
        status: 'active',
      },
    ];

    mockRepository.find.mockResolvedValue(mockCards);

    const result = await service.findByUserId('user123');
    expect(result).toEqual(mockCards);
    expect(mockRepository.find).toHaveBeenCalledWith({
      where: { userId: 'user123' },
      relations: ['transactions'],
    });
  });
});