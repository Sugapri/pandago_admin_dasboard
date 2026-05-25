/**
 * api/wallet.api.js
 * API calls for financial transactions and wallet management.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchWalletQueueFromApi() {
  const response = await fetch(`${API_BASE_URL}/wallet-queue`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Gagal mengambil antrian keuangan");
  const result = await response.json();
  return result.data;
}

export async function verifyWalletTransactionApi(id, action) {
  const response = await fetch(`${API_BASE_URL}/wallet/verify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ id, action }),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.message || "Gagal memproses transaksi");
  return result;
}

export async function manualTopupApi(driverId, amount) {
  const response = await fetch(`${API_BASE_URL}/wallet/manual`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ driver_id: driverId, amount: amount }),
  });
  const result = await response.json();
  if (!response.ok || !result.success)
    throw new Error(result.message || "Gagal melakukan top-up manual");
  return result;
}
