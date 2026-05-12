/**
 * api/passengers.api.js
 */

import { API_BASE_URL, getHeaders } from "../config.js";

export async function fetchPassengersFromApi() {
  const res = await fetch(`${API_BASE_URL}/passengers`, {
    headers: getHeaders()
  });
  const json = await res.json();
  if (!json.success) throw new Error("Failed to fetch passengers");
  return json.data;
}
