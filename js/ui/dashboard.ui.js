/**
 * ui/dashboard.ui.js
 * Logic for updating dashboard stats.
 */

import { fetchStatsFromApi } from "../api/stats.api.js";

/**
 * Fetch and update dashboard stat cards.
 */
export async function updateDashboardStats() {
  try {
    const stats = await fetchStatsFromApi();
    
    document.getElementById("stat-driver-online").textContent = stats.driver_online || 0;
    document.getElementById("stat-order-active").textContent = stats.order_active || 0;
    document.getElementById("stat-pending-verification").textContent = stats.pending_verification || 0;
    document.getElementById("stat-total-revenue").textContent = stats.total_revenue || "Rp 0";
  } catch (e) {
    console.error("Dashboard Stats Error:", e);
  }
}

/**
 * Manually update the online driver count on the dashboard card.
 * @param {number} count 
 */
export function setOnlineDriverStat(count) {
  const el = document.getElementById("stat-driver-online");
  if (el) el.textContent = count;
}
