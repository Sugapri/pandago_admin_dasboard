/**
 * api/promos.api.js
 * HTTP calls for Promo & Voucher Management.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchPromosApi() {
  const res = await fetch(`${API_BASE_URL}/promos`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch promos");
  return json.data;
}

export async function createPromoApi(payload) {
  const res = await fetch(`${API_BASE_URL}/promos`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal membuat promo");
  return json;
}

export async function deletePromoApi(id) {
  const res = await fetch(`${API_BASE_URL}/promos/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal menghapus promo");
  return json;
}
