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
  // Tambahkan 'body' sebagai alias 'message' agar cocok dengan standar FCM/Laravel
  const finalPayload = {
    ...payload,
    body: payload.message,
  };

  const res = await fetch(`${API_BASE_URL}/broadcast`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(finalPayload),
  });

  const json = await res.json();
  if (!json.success)
    throw new Error(json.message || "Gagal mengirim broadcast");
  return json;
}
