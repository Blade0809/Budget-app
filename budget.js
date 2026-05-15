import {
  addTransaction,
  calculateTotals,
  createTransaction,
  formatCurrency,
  removeTransaction,
} from "./src/budgetCore.js";
import { t } from "./src/i18n.js";
import {
  hasCookieConsent,
  loadLanguage,
  loadTransactions,
  saveCookieConsent,
  saveLanguage,
  saveTransactions,
} from "./src/storage.js";
import { initChart, updateChart } from "./chart.js";

const state = {
  transactions: loadTransactions(),
  language: loadLanguage(),
  editingId: null,
};

const els = {
  balance: document.querySelector("[data-balance-value]"),
  incomeTotal: document.querySelector("[data-income-total]"),
  expenseTotal: document.querySelector("[data-expense-total]"),
  incomePanel: document.querySelector("#income"),
  expensePanel: document.querySelector("#expense"),
  allPanel: document.querySelector("#all"),
  incomeList: document.querySelector("#income .list"),
  expenseList: document.querySelector("#expense .list"),
  allList: document.querySelector("#all .list"),
  tabButtons: document.querySelectorAll("[data-tab-target]"),
  forms: document.querySelectorAll("[data-transaction-form]"),
  languageSelect: document.querySelector("#language-select"),
  liveRegion: document.querySelector("#status-message"),
  errorRegion: document.querySelector("#form-error"),
  chart: document.querySelector(".chart"),
  cookieBanner: document.querySelector("#cookie-banner"),
  acceptCookies: document.querySelector("#accept-cookies"),
};

init();

function init() {
  if (!els.balance || !els.incomeTotal || !els.expenseTotal) return;

  initChart(els.chart);
  bindEvents();
  applyLanguage();
  render();
  setupCookieBanner();
}

function bindEvents() {
  els.tabButtons.forEach((button) => {
    button.addEventListener("click", () => showPanel(button.dataset.tabTarget));
  });

  els.forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      handleSubmit(form.dataset.transactionForm);
    });
  });

  [els.incomeList, els.expenseList, els.allList].forEach((list) => {
    list?.addEventListener("click", handleListAction);
  });

  els.languageSelect?.addEventListener("change", (event) => {
    state.language = event.target.value;
    saveLanguage(state.language);
    applyLanguage();
    render();
  });

  els.acceptCookies?.addEventListener("click", () => {
    saveCookieConsent();
    els.cookieBanner?.classList.add("hide");
  });
}

function handleSubmit(type) {
  const titleInput = document.querySelector(`#${type}-title-input`);
  const amountInput = document.querySelector(`#${type}-amount-input`);
  const result = createTransaction(type, titleInput?.value, amountInput?.value);

  if (!result.ok) {
    showErrors(result.errors);
    return;
  }

  if (state.editingId) {
    state.transactions = removeTransaction(state.transactions, state.editingId);
    state.editingId = null;
  }

  state.transactions = addTransaction(state.transactions, result.transaction);
  saveTransactions(state.transactions);
  clearInput([titleInput, amountInput]);
  clearMessage(els.errorRegion);
  render();
  announce(t(state.language, "transactionAdded"));
}

function handleListAction(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const id = button.closest("[data-transaction-id]")?.dataset.transactionId;
  const transaction = state.transactions.find((item) => item.id === id);
  if (!transaction) return;

  if (button.dataset.action === "delete") {
    state.transactions = removeTransaction(state.transactions, id);
    saveTransactions(state.transactions);
    render();
    announce(t(state.language, "transactionRemoved"));
  }

  if (button.dataset.action === "edit") {
    moveTransactionToForm(transaction);
  }
}

function moveTransactionToForm(transaction) {
  const titleInput = document.querySelector(`#${transaction.type}-title-input`);
  const amountInput = document.querySelector(`#${transaction.type}-amount-input`);

  showPanel(transaction.type);
  if (titleInput) titleInput.value = transaction.title;
  if (amountInput) amountInput.value = transaction.amount;
  state.editingId = transaction.id;
  announce(t(state.language, "editingTransaction"));
}

function render() {
  const totals = calculateTotals(state.transactions);
  const locale = state.language === "zh" ? "zh-CN" : "en-US";

  els.balance.textContent = formatCurrency(totals.balance, locale, "USD");
  els.incomeTotal.textContent = formatCurrency(totals.income, locale, "USD");
  els.expenseTotal.textContent = formatCurrency(totals.expense, locale, "USD");

  renderList(els.incomeList, state.transactions.filter((entry) => entry.type === "income"));
  renderList(els.expenseList, state.transactions.filter((entry) => entry.type === "expense"));
  renderList(els.allList, state.transactions);
  updateChart(totals.income, totals.expense);
}

function renderList(list, transactions) {
  if (!list) return;

  list.innerHTML = "";

  if (transactions.length === 0) {
    const emptyItem = document.createElement("li");
    emptyItem.className = "empty-state";
    emptyItem.textContent = t(state.language, "noTransactions");
    list.appendChild(emptyItem);
    return;
  }

  transactions
    .slice()
    .reverse()
    .forEach((transaction) => {
      list.appendChild(createTransactionElement(transaction));
    });
}

function createTransactionElement(transaction) {
  const item = document.createElement("li");
  item.className = transaction.type;
  item.dataset.transactionId = transaction.id;

  const entry = document.createElement("span");
  entry.className = "entry";
  entry.textContent = `${t(state.language, `type${capitalize(transaction.type)}`)}: ${
    transaction.title
  } - ${formatCurrency(transaction.amount, state.language === "zh" ? "zh-CN" : "en-US", "USD")}`;

  const actions = document.createElement("span");
  actions.className = "entry-actions";

  actions.append(
    createIconButton("edit", t(state.language, "edit")),
    createIconButton("delete", t(state.language, "delete"))
  );
  item.append(entry, actions);
  return item;
}

function createIconButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button ${action}-button`;
  button.dataset.action = action;
  button.setAttribute("aria-label", label);
  button.title = label;
  return button;
}

function showPanel(panelId) {
  [els.expensePanel, els.incomePanel, els.allPanel].forEach((panel) => {
    panel?.classList.toggle("hide", panel.id !== panelId);
  });

  els.tabButtons.forEach((button) => {
    const isActive = button.dataset.tabTarget === panelId;
    button.classList.toggle("focus", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
}

function applyLanguage() {
  document.documentElement.lang = state.language === "zh" ? "zh-CN" : "en";
  if (els.languageSelect) els.languageSelect.value = state.language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(state.language, element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = t(state.language, element.dataset.i18nPlaceholder);
  });

  document.querySelectorAll("[data-i18n-label]").forEach((element) => {
    element.setAttribute("aria-label", t(state.language, element.dataset.i18nLabel));
  });

  document.title = t(state.language, "appName");
}

function setupCookieBanner() {
  if (!els.cookieBanner || hasCookieConsent()) {
    els.cookieBanner?.classList.add("hide");
    return;
  }

  els.cookieBanner.classList.remove("hide");
}

function showErrors(errors) {
  const messages = Object.values(errors).map((key) => t(state.language, key));
  if (els.errorRegion) {
    els.errorRegion.textContent = messages.join(" ");
  }
  announce(messages.join(" "));
}

function announce(message) {
  if (els.liveRegion) {
    els.liveRegion.textContent = message;
  }
}

function clearMessage(element) {
  if (element) element.textContent = "";
}

function clearInput(inputs) {
  inputs.forEach((input) => {
    if (input) input.value = "";
  });
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
