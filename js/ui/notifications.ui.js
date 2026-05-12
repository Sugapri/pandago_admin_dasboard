/**
 * ui/notifications.ui.js
 * UI Logic for Broadcast Notifications (Inline Card).
 */

import { sendBroadcastApi } from "../api/notifications.api.js";

/**
 * Submit the broadcast notification to the API.
 */
window.submitBroadcast = async () => {
  const target = document.querySelector("input[name='broadcast_target']:checked")?.value;
  const title = document.getElementById("broadcast-title")?.value.trim();
  const message = document.getElementById("broadcast-message")?.value.trim();

  if (!title || !message) {
    window.showToast?.("Judul dan pesan wajib diisi.", "error");
    return;
  }

  const btn = document.getElementById("broadcast-submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Mengirim...';
  }

  try {
    const payload = { target, title, message };
    const result = await sendBroadcastApi(payload);
    
    window.showToast?.(result.message || "Broadcast berhasil dikirim!", "success");
    
    // Reset form after success
    document.getElementById("broadcast-title").value = "";
    document.getElementById("broadcast-message").value = "";
    
  } catch (e) {
    window.showToast?.(e.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i> Kirim Push Notification';
    }
  }
};
