const BASE_URL = "http://localhost:5000/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.error || "Request failed");
  }
  return json.data;
}

// ─── Transactions ──────────────────────────────────────────────
export function getTransactions(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== "" && v !== null && v !== undefined))
  ).toString();
  return request(`/transactions${qs ? "?" + qs : ""}`);
}

export function getTransaction(id) {
  return request(`/transactions/${id}`);
}

export function createTransaction(data) {
  return request("/transactions", { method: "POST", body: JSON.stringify(data) });
}

export function updateTransaction(id, data) {
  return request(`/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteTransaction(id) {
  return request(`/transactions/${id}`, { method: "DELETE" });
}

// ─── Categories ────────────────────────────────────────────────
export function getCategories(type) {
  return request(`/categories${type ? "?type=" + type : ""}`);
}

export function getCategory(id) {
  return request(`/categories/${id}`);
}

export function createCategory(data) {
  return request("/categories", { method: "POST", body: JSON.stringify(data) });
}

export function updateCategory(id, data) {
  return request(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteCategory(id) {
  return request(`/categories/${id}`, { method: "DELETE" });
}

// ─── Dashboard ─────────────────────────────────────────────────
export function getDashboardSummary(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/dashboard/summary${qs ? "?" + qs : ""}`);
}

export function getDashboardMonthly(year) {
  return request(`/dashboard/monthly${year ? "?year=" + year : ""}`);
}

export function getDashboardCategories(params = {}) {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v))
  ).toString();
  return request(`/dashboard/categories${qs ? "?" + qs : ""}`);
}
