/**
 * api/notifications.api.js
 * HTTP calls for Broadcast Notifications.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

/**
 * Send a broadcast notification to a target group.
 * @param {Object} payload { target, title, message }
 * @returns {Promise<Object>}
 */
export async function sendBroadcastApi(payload) {
  const res = await fetch(`${API_BASE_URL}/broadcast`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Gagal mengirim broadcast");
  return json;
}
