/**
 * api/drivers.api.js
 * Semua HTTP calls yang berhubungan dengan resource Driver.
 * Fungsi di sini hanya melakukan fetch dan return data mentah.
 * Tidak ada logika bisnis, tidak ada DOM manipulation.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Ambil semua driver dari database.
 * @returns {Promise<Array>} Array of driver objects
 */
export async function fetchDriversFromApi() {
  const res = await fetch(`${API_BASE_URL}/drivers`);
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch drivers");
  return json.data;
}

export async function verifyDriverApi(id, status) {
  const res = await fetch(`${API_BASE_URL}/drivers/${id}/verify`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  const result = await res.json();
  if (!result.success && !res.ok) {
    throw new Error(result.message || "Gagal memperbarui status driver.");
  }
  return result;
}

export async function sanctionDriverApi(id, payload) {
  const res = await fetch(`${API_BASE_URL}/drivers/${id}/sanction`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const result = await res.json();
  if (!result.success && !res.ok) {
    throw new Error(result.message || "Gagal menerapkan sanksi.");
  }
  return result;
}
