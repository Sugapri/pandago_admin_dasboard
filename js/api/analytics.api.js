/**
 * api/analytics.api.js
 * API calls for dashboard analytics.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Fetch analytics data from the backend.
 * @returns {Promise<Object>}
 */
export async function fetchAnalyticsFromApi() {
  const response = await fetch(`${API_BASE_URL}/analytics`, {
    headers: getHeaders()
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data analitik");
  }

  const result = await response.json();
  return result.data;
}
