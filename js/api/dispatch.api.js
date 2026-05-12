/**
 * api/dispatch.api.js
 * HTTP calls for AI Dispatcher system.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchDispatchConfigApi() {
  const res = await fetch(`${API_BASE_URL}/dispatch/config`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch dispatch config");
  return json.data;
}

export async function updateDispatchConfigApi(payload) {
  const res = await fetch(`${API_BASE_URL}/dispatch/config`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal memperbarui konfigurasi dispatch");
  return json;
}

export async function toggleDispatchSystemApi(enabled) {
  const res = await fetch(`${API_BASE_URL}/dispatch/toggle`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ enabled }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal mengubah status sistem dispatch");
  return json;
}
