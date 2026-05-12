/**
 * ui/sanction.ui.js
 * Logic for the Sanction Modal.
 */

import { sanctionDriverApi } from "../api/drivers.api.js";
import {
  currentSanctionDriverId,
  setCurrentSanctionDriverId,
} from "../store/state.js";

export function openSanctionModal(driverId, driverName) {
  setCurrentSanctionDriverId(driverId);
  const nameEl = document.getElementById("sanction-driver-name");
  if (nameEl) nameEl.textContent = "Driver: " + driverName;

  // Reset form
  const reasonEl = document.getElementById("sanction-reason");
  const untilEl = document.getElementById("sanction-until");
  if (reasonEl) reasonEl.value = "";
  if (untilEl) untilEl.value = "";

  document.getElementById("duration-field")?.classList.add("hidden");
  document.getElementById("sanction-warning")?.classList.add("hidden");
  document
    .querySelectorAll("input[name='sanction_type']")
    .forEach((r) => (r.checked = false));
  document
    .querySelectorAll(".sanction-type-btn > div")
    .forEach((d) =>
      d.classList.remove("ring-2", "ring-offset-2", "ring-rose-400"),
    );

  const modal = document.getElementById("sanction-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

window.closeSanctionModal = () => {
  const modal = document.getElementById("sanction-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
  setCurrentSanctionDriverId(null);
};

window.onSanctionTypeChange = () => {
  const type = document.querySelector(
    "input[name='sanction_type']:checked",
  )?.value;
  const durationField = document.getElementById("duration-field");
  const warning = document.getElementById("sanction-warning");
  const warningText = document.getElementById("sanction-warning-text");

  if (durationField)
    durationField.classList.toggle("hidden", type !== "suspended_temp");

  if (warning && (type === "suspended_perm" || type === "terminated")) {
    const msgs = {
      suspended_perm:
        "Suspend permanen akan memblokir driver secara permanen. Driver tidak bisa online.",
      terminated:
        "PUTUS MITRA bersifat final. Driver tidak dapat menggunakan aplikasi ini lagi.",
    };
    if (warningText) warningText.textContent = msgs[type];
    warning.classList.remove("hidden");
  } else {
    warning?.classList.add("hidden");
  }

  // Highlight selected card
  document.querySelectorAll(".sanction-type-btn").forEach((btn) => {
    const input = btn.querySelector("input");
    const card = btn.querySelector("div");
    if (input.checked) {
      card.classList.add("ring-2", "ring-offset-2", "ring-rose-400");
    } else {
      card.classList.remove("ring-2", "ring-offset-2", "ring-rose-400");
    }
  });
};

window.submitSanction = async () => {
  const type = document.querySelector(
    "input[name='sanction_type']:checked",
  )?.value;
  const reason = document.getElementById("sanction-reason")?.value.trim();
  const until = document.getElementById("sanction-until")?.value;

  if (!type) {
    window.showToast?.("Pilih jenis sanksi terlebih dahulu.", "error");
    return;
  }
  if (!reason) {
    window.showToast?.("Alasan pelanggaran wajib diisi.", "error");
    return;
  }
  if (type === "suspended_temp" && !until) {
    window.showToast?.("Tanggal suspend wajib diisi.", "error");
    return;
  }

  if (!confirm(`Konfirmasi: Terapkan sanksi kepada driver ini?`)) return;

  const btn = document.getElementById("sanction-submit-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Memproses...";
  }

  try {
    const result = await sanctionDriverApi(currentSanctionDriverId, {
      sanction_type: type,
      reason,
      suspended_until: until || null,
    });

    if (result.success) {
      window.showToast?.(
        result.message || "Sanksi berhasil diterapkan.",
        "success",
      );
      window.closeSanctionModal();
      // We need to reload data. We'll use a custom event or a global refresh.
      window.dispatchEvent(new CustomEvent("app:reload-drivers"));
    }
  } catch (e) {
    window.showToast?.(e.message, "error");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Terapkan Sanksi";
    }
  }
};

// Map global functions to window for legacy onclick support
window.openSanctionModal = openSanctionModal;
