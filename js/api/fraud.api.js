/**
 * api/fraud.api.js
 * API calls for Security & Fraud Detection.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Mengambil daftar peringatan fraud yang aktif.
 * @returns {Promise<Array>}
 */
export async function fetchFraudAlertsApi() {
  const response = await fetch(`${API_BASE_URL}/fraud/alerts`, {
    headers: getHeaders(),
  });
  if (!response.ok) throw new Error("Gagal mengambil data fraud");
  const result = await response.json();
  return result.data;
}

/**
 * Menyelesaikan atau menindaklanjuti laporan fraud.
 * @param {number} id
 * @param {string} action - 'ignore' atau 'sanction'
 */
export async function resolveFraudAlertApi(id, action) {
  const response = await fetch(`${API_BASE_URL}/fraud/resolve`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ id, action }),
  });
  if (!response.ok) throw new Error("Gagal memproses tindakan fraud");
  return await response.json();
}
