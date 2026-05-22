/**
 * api/chats.api.js
 * API calls for chat monitoring.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Fetch all chat conversations from the backend.
 * @returns {Promise<Array>}
 */
export async function fetchAllChatsFromApi() {
  const response = await fetch(`${API_BASE_URL}/chats`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil data chat");
  }

  const result = await response.json();
  return result.data;
}
