/**
 * api/fraud.api.js
 * HTTP calls for Security & Fraud Detection.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchFraudAlertsApi() {
  const res = await fetch(`${API_BASE_URL}/fraud/alerts`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch fraud alerts");
  return json.data;
}

export async function resolveFraudAlertApi(id, action) {
  const res = await fetch(`${API_BASE_URL}/fraud/alerts/${id}/resolve`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ action }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal memproses alert fraud");
  return json;
}
