/**
 * api/analytics.api.js
 * API calls for dashboard analytics.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Fetch analytics data from the backend.
 * @param {string} range - Filter rentang waktu ('7d', '30d', 'month')
 * @returns {Promise<Object>}
 */
export async function fetchAnalyticsFromApi(range = "7d") {
  try {
    const response = await fetch(`${API_BASE_URL}/analytics?range=${range}`, {
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    // Melempar error agar ditangkap oleh UI loader
    throw error;
  }
}
