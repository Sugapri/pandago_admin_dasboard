/**
 * ui/fraud.ui.js
 * Logic for Security & Fraud Detection: rendering alerts and toggling.
 */

import { fetchFraudAlertsApi, resolveFraudAlertApi } from "../api/fraud.api.js";

export async function loadFraudData() {
  try {
    const alerts = await fetchFraudAlertsApi();
    renderFraudAlerts(alerts);
    
    const badge = document.getElementById("fraud-count-badge");
    if (badge) {
      badge.textContent = `${alerts.length} Alerts`;
      badge.className = alerts.length > 0 
        ? "bg-rose-100 text-rose-700 text-[10px] font-black px-3 py-1 rounded-full uppercase animate-pulse"
        : "bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full uppercase";
    }
  } catch (e) {
    console.error("Fraud Error:", e);
    // Simulation for demo
    renderFraudAlerts([
      { id: 1, time: "14:20", subject: "Driver @andi_jkt", type: "Mock GPS Detected", risk: "high" },
      { id: 2, time: "14:35", subject: "User @budi_s", type: "Order Manipulation", risk: "medium" }
    ]);
  }
}

function renderFraudAlerts(alerts) {
  const tbody = document.getElementById("fraud-tbody");
  const empty = document.getElementById("fraud-empty");
  if (!tbody) return;

  if (!alerts.length) {
    tbody.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  tbody.innerHTML = alerts.map(a => {
    const riskClass = a.risk === 'high' ? 'bg-rose-100 text-rose-700' : 
                      a.risk === 'medium' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-100 text-slate-700';

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-5 text-slate-400 font-bold">${a.time}</td>
        <td class="px-8 py-5 font-black text-slate-800">${a.subject}</td>
        <td class="px-8 py-5">
          <span class="text-xs font-bold text-slate-600">${a.type}</span>
        </td>
        <td class="px-8 py-5">
          <span class="${riskClass} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
            ${a.risk} risk
          </span>
        </td>
        <td class="px-8 py-5 text-center">
          <div class="flex justify-center gap-2">
            <button onclick="window.resolveFraud(${a.id}, 'ignore')" class="text-slate-300 hover:text-emerald-500 transition active:scale-90 p-2">
              <i class="fas fa-check"></i>
            </button>
            <button onclick="window.resolveFraud(${a.id}, 'sanction')" class="text-slate-300 hover:text-rose-600 transition active:scale-90 p-2">
              <i class="fas fa-gavel"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

window.toggleFraudTable = () => {
  const wrapper = document.getElementById("fraud-table-wrapper");
  const label = document.getElementById("fraud-toggle-label");
  const icon = document.getElementById("fraud-toggle-icon");
  const isHidden = wrapper.classList.contains("hidden");

  if (isHidden) {
    wrapper.classList.remove("hidden");
    if (label) label.textContent = "Sembunyikan";
    if (icon) icon.style.transform = "rotate(180deg)";
  } else {
    wrapper.classList.add("hidden");
    if (label) label.textContent = "Tampilkan";
    if (icon) icon.style.transform = "rotate(0deg)";
  }
};

window.resolveFraud = async (id, action) => {
  if (!confirm(`Konfirmasi tindakan: ${action}?`)) return;
  try {
    await resolveFraudAlertApi(id, action);
    window.showToast?.("Berhasil memproses laporan fraud", "success");
    loadFraudData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
