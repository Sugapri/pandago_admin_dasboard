/**
 * api/pricing.api.js
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchPricingFromApi() {
  const res = await fetch(`${API_BASE_URL}/pricing`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch pricing");
  return json.data;
}

export async function updatePricingApi(payload) {
  const res = await fetch(`${API_BASE_URL}/pricing`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!result.success) throw new Error(result.message || "Gagal menyimpan tarif.");
  return result;
}
