/**
 * api/wallet.api.js
 * API calls for financial transactions and wallet management.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchWalletQueueFromApi() {
  const response = await fetch(`${API_BASE_URL}/wallet-queue`, {
    headers: getHeaders()
  });
  if (!response.ok) throw new Error("Gagal mengambil antrian keuangan");
  const result = await response.json();
  return result.data;
}

export async function verifyWalletTransactionApi(id, action) {
  const response = await fetch(`${API_BASE_URL}/wallet/verify`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id, action })
  });
  if (!response.ok) throw new Error("Gagal memproses transaksi");
  return await response.json();
}

export async function manualTopupApi(driverId, amount) {
  const response = await fetch(`${API_BASE_URL}/wallet/manual`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ driver_id: driverId, amount: amount })
  });
  if (!response.ok) throw new Error("Gagal melakukan top-up manual");
  return await response.json();
}
