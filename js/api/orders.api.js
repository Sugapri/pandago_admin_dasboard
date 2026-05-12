/**
 * api/orders.api.js
 * HTTP calls untuk resource Order.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Ambil semua order (max 100 terbaru).
 * @returns {Promise<Array>}
 */
export async function fetchOrdersFromApi() {
  const res = await fetch(`${API_BASE_URL}/orders`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch orders");
  return json.data;
}

/**
 * Reset semua data revenue/order (berbahaya — hanya Super Admin).
 * @returns {Promise<Object>}
 */
export async function resetRevenueApi() {
  const res = await fetch(`${API_BASE_URL}/reset-revenue`, {
    method: "POST",
    headers: getHeaders(),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Gagal mereset.");
  return result;
}
