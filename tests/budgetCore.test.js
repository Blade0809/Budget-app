import { describe, expect, it } from "vitest";
import {
  addTransaction,
  calculateTotals,
  createTransaction,
  formatCurrency,
  removeTransaction,
  validateTransactionInput,
} from "../src/budgetCore.js";

describe("budget core", () => {
  it("creates a valid income transaction", () => {
    const result = createTransaction("income", "Salary", "1200");

    expect(result.ok).toBe(true);
    expect(result.transaction).toMatchObject({
      type: "income",
      title: "Salary",
      amount: 1200,
    });
    expect(result.transaction.id).toBeTruthy();
  });

  it("rejects an empty title", () => {
    const result = validateTransactionInput("expense", "   ", "10");

    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe("error.emptyTitle");
  });

  it("rejects an empty amount", () => {
    const result = validateTransactionInput("expense", "Coffee", "");

    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe("error.emptyAmount");
  });

  it("rejects a non-numeric amount", () => {
    const result = validateTransactionInput("expense", "Coffee", "abc");

    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe("error.invalidAmount");
  });

  it("rejects a negative amount", () => {
    const result = validateTransactionInput("expense", "Coffee", "-3");

    expect(result.isValid).toBe(false);
    expect(result.errors.amount).toBe("error.positiveAmount");
  });

  it("rejects an invalid transaction type", () => {
    const result = validateTransactionInput("saving", "Bank", "100");

    expect(result.isValid).toBe(false);
    expect(result.errors.type).toBe("error.invalidType");
  });

  it("returns structured errors when creating an invalid transaction", () => {
    const result = createTransaction("expense", "", "0");

    expect(result.ok).toBe(false);
    expect(result.errors).toMatchObject({
      title: "error.emptyTitle",
      amount: "error.positiveAmount",
    });
  });

  it("calculates income, expense, and balance totals", () => {
    const totals = calculateTotals([
      { id: "1", type: "income", title: "Salary", amount: 1000 },
      { id: "2", type: "expense", title: "Rent", amount: 400 },
      { id: "3", type: "expense", title: "Food", amount: 80 },
    ]);

    expect(totals.income).toBe(1000);
    expect(totals.expense).toBe(480);
    expect(totals.balance).toBe(520);
  });

  it("adds a transaction immutably", () => {
    const original = [{ id: "1", type: "income", title: "Salary", amount: 1000 }];
    const added = { id: "2", type: "expense", title: "Food", amount: 50 };

    const result = addTransaction(original, added);

    expect(result).toHaveLength(2);
    expect(original).toHaveLength(1);
  });

  it("removes a transaction by id", () => {
    const transactions = [
      { id: "1", type: "income", title: "Salary", amount: 1000 },
      { id: "2", type: "expense", title: "Food", amount: 50 },
    ];

    expect(removeTransaction(transactions, "2")).toEqual([transactions[0]]);
  });

  it("formats currency for a locale", () => {
    expect(formatCurrency(1234.5, "en-US", "USD")).toBe("$1,234.50");
  });
});
