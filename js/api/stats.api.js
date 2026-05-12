/**
 * api/stats.api.js
 * HTTP calls untuk dashboard statistics.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Ambil statistik dashboard dari server.
 * @returns {Promise<Object>} stats object
 */
export async function fetchStatsFromApi() {
  const res = await fetch(`${API_BASE_URL}/stats`, {
    headers: getHeaders()
  });
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch stats");
  return data.stats;
}
