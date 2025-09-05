import "@typespec/http";
import "@typespec/rest";
import "@typespec/openapi3";

using TypeSpec.Http;
using TypeSpec.Rest;
using TypeSpec.OpenAPI;

@service({
  title: "freee Card Payment Service",
  version: "1.0.0",
})
@server("https://api.freee.co.jp/card", "Production server")
namespace FreeeCard;

@doc("Card transaction model")
model CardTransaction {
  @key
  id: string;
  
  @doc("Transaction amount in JPY")
  amount: int32;
  
  @doc("Merchant name")
  merchantName: string;
  
  @doc("Transaction date")
  transactionDate: utcDateTime;
  
  @doc("Card last 4 digits")
  cardLastFour: string;
  
  @doc("Transaction status")
  status: TransactionStatus;
  
  @doc("User ID who made the transaction")
  userId: string;
  
  @doc("Category for expense")
  category?: string;
  
  @doc("Notes or memo")
  memo?: string;
}

@doc("Transaction status enum")
enum TransactionStatus {
  pending: "pending",
  completed: "completed",
  failed: "failed",
  cancelled: "cancelled",
}

@doc("Card information model")
model Card {
  @key
  id: string;
  
  @doc("Card holder name")
  cardholderName: string;
  
  @doc("Card last 4 digits")
  lastFour: string;
  
  @doc("Card brand")
  brand: CardBrand;
  
  @doc("Expiry date")
  expiryDate: string;
  
  @doc("Card status")
  status: CardStatus;
  
  @doc("User ID")
  userId: string;
  
  @doc("Credit limit in JPY")
  creditLimit: int32;
  
  @doc("Available balance in JPY")
  availableBalance: int32;
}

enum CardBrand {
  visa: "visa",
  mastercard: "mastercard",
  jcb: "jcb",
  amex: "amex",
}

enum CardStatus {
  active: "active",
  suspended: "suspended",
  cancelled: "cancelled",
}

@route("/transactions")
interface TransactionOperations {
  @get
  @doc("List all transactions with pagination")
  list(
    @query limit?: int32 = 20,
    @query offset?: int32 = 0,
    @query userId?: string,
    @query status?: TransactionStatus,
    @query fromDate?: utcDateTime,
    @query toDate?: utcDateTime,
  ): {
    @statusCode statusCode: 200;
    @body transactions: CardTransaction[];
    @header("X-Total-Count") totalCount: int32;
  };

  @get
  @route("{transactionId}")
  @doc("Get transaction by ID")
  read(
    @path transactionId: string,
  ): {
    @statusCode statusCode: 200;
    @body transaction: CardTransaction;
  } | {
    @statusCode statusCode: 404;
    @body error: Error;
  };

  @post
  @doc("Create a new transaction")
  create(
    @body transaction: CardTransaction,
  ): {
    @statusCode statusCode: 201;
    @body created: CardTransaction;
  } | {
    @statusCode statusCode: 400;
    @body error: Error;
  };

  @patch
  @route("{transactionId}")
  @doc("Update transaction (category, memo)")
  update(
    @path transactionId: string,
    @body updates: {
      category?: string;
      memo?: string;
    },
  ): {
    @statusCode statusCode: 200;
    @body updated: CardTransaction;
  } | {
    @statusCode statusCode: 404;
    @body error: Error;
  };
}

@route("/cards")
interface CardOperations {
  @get
  @doc("List all cards for a user")
  list(
    @query userId: string,
  ): {
    @statusCode statusCode: 200;
    @body cards: Card[];
  };

  @get
  @route("{cardId}")
  @doc("Get card details")
  read(
    @path cardId: string,
  ): {
    @statusCode statusCode: 200;
    @body card: Card;
  } | {
    @statusCode statusCode: 404;
    @body error: Error;
  };

  @post
  @route("{cardId}/suspend")
  @doc("Suspend a card")
  suspend(
    @path cardId: string,
  ): {
    @statusCode statusCode: 200;
    @body card: Card;
  } | {
    @statusCode statusCode: 404;
    @body error: Error;
  };

  @post
  @route("{cardId}/activate")
  @doc("Activate a suspended card")
  activate(
    @path cardId: string,
  ): {
    @statusCode statusCode: 200;
    @body card: Card;
  } | {
    @statusCode statusCode: 404;
    @body error: Error;
  };
}

@error
model Error {
  code: string;
  message: string;
  details?: string;
}