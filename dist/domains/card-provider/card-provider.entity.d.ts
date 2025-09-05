import { BusinessCard } from '../business-card/business-card.entity';
export declare enum CardProviderType {
    FREEE_NATIVE = "freee-native",
    PARTNER = "partner",
    EXTERNAL = "external"
}
export declare enum CardProviderStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    DEPRECATED = "deprecated"
}
export declare class CardProvider {
    id: string;
    name: string;
    displayName: string;
    type: CardProviderType;
    status: CardProviderStatus;
    realTimeSync: boolean;
    dataAccuracy: number;
    syncIntervalMinutes?: number;
    apiEndpoint?: string;
    webhookUrl?: string;
    requiresManualSync: boolean;
    revenueShareRate: number;
    customerAcquisitionCost: number;
    processingFee: number;
    cards: BusinessCard[];
    createdAt: Date;
    updatedAt: Date;
    isRealTime(): boolean;
    getExpectedSyncDelay(): number;
    calculateRevenue(transactionAmount: number): number;
    isHighPriority(): boolean;
}
