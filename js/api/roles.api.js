/**
 * api/roles.api.js
 * HTTP calls for Admin Role & Permission Management.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchAdminsApi() {
  const res = await fetch(`${API_BASE_URL}/admins`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch admins");
  return json.data;
}

export async function createAdminApi(payload) {
  const res = await fetch(`${API_BASE_URL}/admins`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal menambah admin");
  return json;
}

export async function deleteAdminApi(id) {
  const res = await fetch(`${API_BASE_URL}/admins/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal menghapus admin");
  return json;
}
