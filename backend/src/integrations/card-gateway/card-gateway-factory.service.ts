import { Injectable } from '@nestjs/common';
import { CardProvider } from '../../domains/card-provider/card-provider.entity';

export interface ICardGateway {
  syncTransactions(cardId: string): Promise<any[]>;
  getBalance(cardId: string): Promise<number>;
  getTransactions(externalCardId: string, startDate: Date, endDate: Date): Promise<any[]>;
}

class MockCardGateway implements ICardGateway {
  async syncTransactions(cardId: string): Promise<any[]> {
    // Mock 구현 - 실제로는 카드사 API 호출
    return [];
  }

  async getBalance(cardId: string): Promise<number> {
    // Mock 구현
    return 100000;
  }

  async getTransactions(externalCardId: string, startDate: Date, endDate: Date): Promise<any[]> {
    // Mock 구현 - 실제로는 카드사 API 호출
    return [];
  }
}

@Injectable()
export class CardGatewayFactory {
  createGateway(provider: CardProvider): ICardGateway {
    // 프로바이더별로 다른 게이트웨이 생성
    switch (provider.type) {
      case 'freee-native':
        return new MockCardGateway(); // FreeeCardGateway 구현 예정
      case 'partner':
        return new MockCardGateway(); // PartnerCardGateway 구현 예정
      case 'external':
        return new MockCardGateway(); // ExternalCardGateway 구현 예정
      default:
        throw new Error(`Unsupported provider type: ${provider.type}`);
    }
  }
}