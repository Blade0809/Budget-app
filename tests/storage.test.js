import { describe, expect, it } from "vitest";
import {
  hasCookieConsent,
  loadLanguage,
  loadTransactions,
  saveCookieConsent,
  saveLanguage,
  saveTransactions,
  STORAGE_KEYS,
} from "../src/storage.js";

function createMemoryStorage(initialValues = {}) {
  const store = new Map(Object.entries(initialValues));
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
  };
}

describe("storage helpers", () => {
  it("loads valid transactions", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.transactions]: JSON.stringify([
        { id: "1", type: "income", title: "Salary", amount: 1000 },
      ]),
    });

    expect(loadTransactions(storage)).toHaveLength(1);
  });

  it("falls back to an empty list when localStorage data is damaged", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.transactions]: "{not json",
    });

    expect(loadTransactions(storage)).toEqual([]);
  });

  it("filters malformed stored transactions", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.transactions]: JSON.stringify([
        { id: "1", type: "income", title: "Salary", amount: 1000 },
        { id: "2", type: "gift", title: "Bad", amount: 10 },
      ]),
    });

    expect(loadTransactions(storage)).toEqual([
      { id: "1", type: "income", title: "Salary", amount: 1000 },
    ]);
  });

  it("saves transactions as JSON", () => {
    const storage = createMemoryStorage();

    saveTransactions([{ id: "1", type: "expense", title: "Lunch", amount: 12 }], storage);

    expect(JSON.parse(storage.getItem(STORAGE_KEYS.transactions))).toHaveLength(1);
  });

  it("persists supported language choices", () => {
    const storage = createMemoryStorage();

    saveLanguage("zh", storage);

    expect(loadLanguage(storage)).toBe("zh");
  });

  it("falls back to English for unsupported language choices", () => {
    const storage = createMemoryStorage({
      [STORAGE_KEYS.language]: "fr",
    });

    expect(loadLanguage(storage)).toBe("en");
  });

  it("saves cookie consent", () => {
    const storage = createMemoryStorage();

    saveCookieConsent(storage);

    expect(hasCookieConsent(storage)).toBe(true);
  });

  it("falls back safely when storage methods throw", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };

    expect(loadTransactions(throwingStorage)).toEqual([]);
    expect(loadLanguage(throwingStorage)).toBe("en");
    expect(hasCookieConsent(throwingStorage)).toBe(false);
    expect(() => saveTransactions([], throwingStorage)).not.toThrow();
    expect(() => saveLanguage("zh", throwingStorage)).not.toThrow();
    expect(() => saveCookieConsent(throwingStorage)).not.toThrow();
  });

  it("uses a memory storage fallback outside the browser", () => {
    expect(loadTransactions()).toEqual([]);
    expect(() => saveTransactions([])).not.toThrow();
  });
});
