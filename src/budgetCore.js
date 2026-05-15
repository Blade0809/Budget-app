export const TRANSACTION_TYPES = ["income", "expense"];

export function validateTransactionInput(type, title, amount) {
  const errors = {};
  const normalizedType = String(type || "").trim();
  const normalizedTitle = String(title || "").trim();
  const normalizedAmount = String(amount ?? "").trim();
  const numericAmount = Number(normalizedAmount);

  if (!TRANSACTION_TYPES.includes(normalizedType)) {
    errors.type = "error.invalidType";
  }

  if (!normalizedTitle) {
    errors.title = "error.emptyTitle";
  }

  if (!normalizedAmount) {
    errors.amount = "error.emptyAmount";
  } else if (!Number.isFinite(numericAmount)) {
    errors.amount = "error.invalidAmount";
  } else if (numericAmount <= 0) {
    errors.amount = "error.positiveAmount";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    values: {
      type: normalizedType,
      title: normalizedTitle,
      amount: numericAmount,
    },
  };
}

export function createTransaction(type, title, amount) {
  const validation = validateTransactionInput(type, title, amount);

  if (!validation.isValid) {
    return {
      ok: false,
      errors: validation.errors,
    };
  }

  return {
    ok: true,
    transaction: {
      id: createTransactionId(),
      type: validation.values.type,
      title: validation.values.title,
      amount: validation.values.amount,
    },
  };
}

export function calculateTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      if (transaction.type === "income") {
        totals.income += transaction.amount;
      }

      if (transaction.type === "expense") {
        totals.expense += transaction.amount;
      }

      totals.balance = totals.income - totals.expense;
      return totals;
    },
    { income: 0, expense: 0, balance: 0 }
  );
}

export function addTransaction(transactions, transaction) {
  return [...transactions, transaction];
}

export function removeTransaction(transactions, id) {
  return transactions.filter((transaction) => transaction.id !== id);
}

export function formatCurrency(value, locale = "en-US", currency = "USD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

function createTransactionId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `transaction-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
