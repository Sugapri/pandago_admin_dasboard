/**
 * main.js
 * Application Entry Point.
 * Coordinates all modules and initializes the app.
 */

import { POLL_INTERVALS } from "./config.js";
import { initMap } from "./ui/map.ui.js";
import { updateDashboardStats } from "./ui/dashboard.ui.js";
import { loadDriversData } from "./ui/drivers.ui.js";
import { loadOrdersData } from "./ui/orders.ui.js";
import { loadPassengersData } from "./ui/passengers.ui.js";
import { loadPricingData } from "./ui/pricing.ui.js";
import { initAnalytics } from "./ui/analytics.ui.js";
import { loadWalletData } from "./ui/wallet.ui.js";
import { loadCommissionData } from "./ui/commission.ui.js";
import { loadPromosData } from "./ui/promos.ui.js";
import { loadRolesData } from "./ui/roles.ui.js";
import { initDispatchUi } from "./ui/dispatch.ui.js";
import { loadFraudData } from "./ui/fraud.ui.js";
import "./ui/notifications.ui.js";

// ── Initialization ───────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", async () => {
  console.log("🚀 Anterin Admin Dashboard Initializing...");

  // Initialize UI components
  initMap();
  
  // Load initial data
  updateDashboardStats();
  initAnalytics();
  loadWalletData();
  loadCommissionData();
  loadDriversData();
  loadOrdersData();
  loadPricingData();
  loadPassengersData();
  loadPromosData();
  loadRolesData();
  initDispatchUi();
  loadFraudData();

  // Setup Intervals
  setInterval(updateDashboardStats, POLL_INTERVALS.stats);
  setInterval(initAnalytics, POLL_INTERVALS.stats); 
  setInterval(loadWalletData, POLL_INTERVALS.stats); 
  setInterval(loadCommissionData, POLL_INTERVALS.stats); 
  setInterval(loadPromosData, POLL_INTERVALS.stats); 
  setInterval(loadRolesData, POLL_INTERVALS.stats); 
  setInterval(loadFraudData, POLL_INTERVALS.stats); 
  setInterval(loadDriversData, POLL_INTERVALS.drivers);
  setInterval(loadOrdersData, POLL_INTERVALS.orders);
  setInterval(() => {
    loadDriversData(); // Re-sync management list more slowly
  }, POLL_INTERVALS.driversList);

  console.log("✅ Initialization Complete.");
});

// ── Global Toast Helper ──────────────────────────────────────────────────────

window.showToast = (message, type = "success") => {
  const existing = document.getElementById("toast-notif");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.id = "toast-notif";
  toast.className = `fixed bottom-8 right-8 z-[100] px-6 py-4 rounded-2xl shadow-2xl font-black text-xs uppercase tracking-widest transform transition-all duration-500 translate-y-20 opacity-0 flex items-center gap-3 border ${
    type === "success"
      ? "bg-emerald-600 text-white border-emerald-400"
      : "bg-rose-600 text-white border-rose-400"
  }`;

  const icon = type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  toast.innerHTML = `<i class="fas ${icon} text-lg"></i> <span>${message}</span>`;

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove("translate-y-20", "opacity-0");
  }, 100);

  // Auto-hide
  setTimeout(() => {
    toast.classList.add("translate-y-20", "opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 4000);
};

// ── Event Listeners ─────────────────────────────────────────────────────────

window.addEventListener('app:reload-drivers', () => {
  loadDriversData();
});
