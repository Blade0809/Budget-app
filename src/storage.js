export const STORAGE_KEYS = {
  transactions: "budget_app_transactions",
  language: "budget_app_language",
  cookieConsent: "budget_app_cookie_consent",
};

export function loadTransactions(storage = getStorage()) {
  try {
    const rawData = storage.getItem(STORAGE_KEYS.transactions) || storage.getItem("entry_list");
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    if (!Array.isArray(parsedData)) return [];

    return parsedData.map(normalizeStoredTransaction).filter(Boolean);
  } catch {
    return [];
  }
}

export function saveTransactions(transactions, storage = getStorage()) {
  try {
    storage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  } catch {
    // The app remains usable even when browser storage is unavailable.
  }
}

export function loadLanguage(storage = getStorage()) {
  try {
    const language = storage.getItem(STORAGE_KEYS.language);
    return language === "zh" ? "zh" : "en";
  } catch {
    return "en";
  }
}

export function saveLanguage(language, storage = getStorage()) {
  try {
    storage.setItem(STORAGE_KEYS.language, language);
  } catch {
    // Language switching still works for the current session.
  }
}

export function hasCookieConsent(storage = getStorage()) {
  try {
    return storage.getItem(STORAGE_KEYS.cookieConsent) === "accepted";
  } catch {
    return false;
  }
}

export function saveCookieConsent(storage = getStorage()) {
  try {
    storage.setItem(STORAGE_KEYS.cookieConsent, "accepted");
  } catch {
    // Consent banner can still be dismissed visually for this page load.
  }
}

function normalizeStoredTransaction(transaction, index) {
  if (
    !transaction ||
    !["income", "expense"].includes(transaction.type) ||
    typeof transaction.title !== "string" ||
    !Number.isFinite(transaction.amount) ||
    transaction.amount <= 0
  ) {
    return null;
  }

  return {
    id: typeof transaction.id === "string" ? transaction.id : `legacy-${index}`,
    type: transaction.type,
    title: transaction.title,
    amount: transaction.amount,
  };
}

function getStorage() {
  if (typeof window === "undefined" || !window.localStorage) {
    return createMemoryStorage();
  }

  return window.localStorage;
}

function createMemoryStorage() {
  const store = new Map();

  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, String(value)),
  };
}
