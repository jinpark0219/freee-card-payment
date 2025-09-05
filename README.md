# freee Card Payment System MVP

## 概要
freeeカード決済システムのMVP実装。マイクロサービスアーキテクチャを採用し、カード管理と決済処理を行う。

## アーキテクチャ

### 技術スタック
- **API定義**: TypeSpec → OpenAPI
- **バックエンド**: Go (Domain-Driven Design)
- **データベース**: PostgreSQL
- **キャッシュ**: Redis
- **コンテナ**: Docker

### ディレクトリ構造
```
payment/
├── card-payment-api.tsp      # API定義（TypeSpec）
├── card-service/             # カードマイクロサービス
│   ├── domain/              # ドメイン層
│   │   ├── model/          # エンティティ
│   │   └── repository/     # リポジトリインターフェース
│   └── usecase/            # ユースケース層
├── docker-compose.yml       # Docker構成
└── README.md
```

### ドメインモデル

#### Card（カード）
- カード情報の管理
- ステータス管理（active/suspended/cancelled）
- 利用可能残高の追跡

#### CardTransaction（カード取引）
- 決済トランザクションの記録
- カテゴリ・メモの管理
- ステータス遷移（pending→completed/failed/cancelled）

### API エンドポイント

#### Cards API
- `GET /cards` - ユーザーのカード一覧取得
- `GET /cards/{cardId}` - カード詳細取得
- `POST /cards/{cardId}/suspend` - カード利用停止
- `POST /cards/{cardId}/activate` - カード利用再開

#### Transactions API
- `GET /transactions` - 取引一覧取得（フィルタリング対応）
- `GET /transactions/{transactionId}` - 取引詳細取得
- `POST /transactions` - 新規取引作成
- `PATCH /transactions/{transactionId}` - 取引更新（カテゴリ・メモ）

### 起動方法

```bash
# TypeSpecからOpenAPI生成
tsp compile card-payment-api.tsp

# Docker環境起動
docker-compose up -d

# データベースマイグレーション（実装時に追加）
# make migrate
```

### テスト戦略

1. **Unit Test**: ドメインモデルのビジネスロジック
2. **Integration Test**: リポジトリ層のデータベース連携
3. **E2E Test**: APIエンドポイントの統合テスト

### 今後の実装予定

- [ ] インフラ層の実装（リポジトリ実装）
- [ ] APIハンドラー層の実装
- [ ] 認証・認可の実装
- [ ] BFFの実装
- [ ] フロントエンドの実装
- [ ] 監視・ロギング機能
- [ ] CI/CDパイプライン