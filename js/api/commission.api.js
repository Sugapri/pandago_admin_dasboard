/**
 * api/commission.api.js
 * API calls for commission billing and verification.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchCommissionQueueFromApi() {
  const response = await fetch(`${API_BASE_URL}/commission-queue`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Gagal mengambil antrian komisi");
  return await response.json();
}

export async function verifyCommissionPaymentApi(id, action, reason = "") {
  const response = await fetch(`${API_BASE_URL}/commission/verify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ id, action, reason }),
  });

  // Lebih aman: coba parse JSON walaupun status error
  let payload = null;
  try {
    payload = await response.json();
  } catch (_) {}

  if (!response.ok) {
    const message =
      payload?.message || payload?.error || "Gagal memproses verifikasi komisi";
    throw new Error(message);
  }

  return payload;
}
