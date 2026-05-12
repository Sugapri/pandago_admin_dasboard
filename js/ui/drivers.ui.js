/**
 * ui/drivers.ui.js
 * Logic for rendering driver tables (Verification Queue & Management Table).
 */

import { fetchDriversFromApi, verifyDriverApi } from "../api/drivers.api.js";
import { getVerificationQueue, getDriverStatusConfig, isSanctioned } from "../business/drivers.logic.js";
import { numberFormat } from "../utils/format.js";
import { setOnlineDriverStat } from "./dashboard.ui.js";
import { updateMapMarkers } from "./map.ui.js";
import { openSanctionModal } from "./sanction.ui.js";

/**
 * Load and render both driver-related tables.
 */
export async function loadDriversData() {
  try {
    const drivers = await fetchDriversFromApi();

    // 1. Update Map & Stats
    const onlineDrivers = drivers.filter(d => d.is_online);
    setOnlineDriverStat(onlineDrivers.length);
    updateMapMarkers(drivers);

    // 2. Render Verification Queue
    renderVerificationQueue(drivers);

    // 3. Render Management Table
    renderManagementTable(drivers);

  } catch (e) {
    console.error("Load Drivers Error:", e);
  }
}

/**
 * Render the Verification Queue table (Pending/Verified/Rejected).
 */
function renderVerificationQueue(drivers) {
  const queue = getVerificationQueue(drivers);
  const pendingCount = queue.filter(d => d.status === "pending").length;
  
  const badge = document.getElementById("verifikasi-badge");
  if (badge) {
    if (pendingCount > 0) {
      badge.textContent = `${pendingCount} Perlu Tindakan`;
      badge.className = "bg-amber-100 text-amber-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase";
    } else {
      badge.textContent = "Semua Terverifikasi";
      badge.className = "bg-emerald-100 text-emerald-700 text-[10px] font-black px-4 py-1.5 rounded-full uppercase";
    }
  }

  const tbody = document.querySelector("#verifikasi tbody");
  if (!tbody) return;

  tbody.innerHTML = queue.map((d) => {
    const isVerified = d.status === "verified";
    const isRejected = d.status === "rejected";
    const isPending = d.status === "pending";
    
    const avatarBg = isVerified ? "bg-emerald-100" : isRejected ? "bg-rose-100" : "bg-amber-100";
    const avatarText = isVerified ? "text-emerald-600" : isRejected ? "text-rose-600" : "text-amber-600";
    
    const statusBadge = isVerified
      ? `<span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase border border-emerald-200"><i class="fas fa-circle-check"></i> VERIFIED</span>`
      : isRejected
        ? `<span class="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase border border-rose-200"><i class="fas fa-circle-xmark"></i> DITOLAK</span>`
        : `<span class="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase border border-amber-200 animate-pulse"><i class="fas fa-clock"></i> MENUNGGU</span>`;

    const actionButtons = isPending
      ? `<div class="flex justify-center space-x-2">
           <button onclick="window.actionDriver(${d.id}, 'verified')" class="bg-emerald-500 text-white w-8 h-8 rounded-lg hover:bg-emerald-600 shadow-md transition active:scale-90"><i class="fas fa-check text-xs"></i></button>
           <button onclick="window.actionDriver(${d.id}, 'rejected')" class="bg-rose-500 text-white w-8 h-8 rounded-lg hover:bg-rose-600 shadow-md transition active:scale-90"><i class="fas fa-times text-xs"></i></button>
         </div>`
      : isVerified
        ? `<div class="flex justify-center"><span class="text-emerald-500 text-xl"><i class="fas fa-circle-check"></i></span></div>`
        : `<div class="flex justify-center">
             <button onclick="window.actionDriver(${d.id}, 'verified')" class="bg-slate-200 text-slate-500 w-8 h-8 rounded-lg hover:bg-emerald-500 hover:text-white shadow-md transition active:scale-90"><i class="fas fa-rotate-right text-xs"></i></button>
           </div>`;

    return `
      <tr class="hover:bg-slate-50/80 transition ${isVerified ? "opacity-70" : ""}">
        <td class="px-8 py-6">
          <div class="flex items-center space-x-4">
            <div class="w-10 h-10 ${avatarBg} rounded-xl flex items-center justify-center ${avatarText} font-black text-xs uppercase">${(d.name || "??").substring(0, 2)}</div>
            <div>
              <p class="font-bold text-slate-800 text-sm">${d.name}</p>
              <p class="text-[10px] text-slate-400">${d.phone}</p>
            </div>
          </div>
        </td>
        <td class="px-8 py-6 text-xs font-bold text-slate-500 uppercase">${d.plate_number || "-"}</td>
        <td class="px-8 py-6">${statusBadge}</td>
        <td class="px-8 py-6">${actionButtons}</td>
      </tr>`;
  }).join("");
}

/**
 * Render the main Driver Management table.
 */
function renderManagementTable(drivers) {
  const tbody = document.querySelector("#drivers-table tbody");
  if (!tbody) return;

  tbody.innerHTML = drivers.map((d) => {
    const sc = getDriverStatusConfig(d.status);
    const statusBadge = `<span class="inline-flex items-center gap-1.5 ${sc.bg} ${sc.text} text-[10px] font-black px-3 py-1.5 rounded-full uppercase"><i class="fas ${sc.icon}"></i> ${sc.label}</span>`;

    const sanctioned = isSanctioned(d.status);
    const actionButtons = sanctioned
      ? `<div class="flex flex-col items-center gap-1">
           <button onclick="window.openSanctionModal(${d.id}, '${d.name.replace(/'/g, "\\'")}')" class="bg-orange-100 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-white transition text-[10px] font-black uppercase">Ubah Sanksi</button>
           <button onclick="window.actionDriver(${d.id}, 'verified')" class="bg-emerald-100 text-emerald-600 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition text-[10px] font-black uppercase">Pulihkan</button>
         </div>`
      : d.status === "verified"
        ? `<button onclick="window.openSanctionModal(${d.id}, '${d.name.replace(/'/g, "\\'")}')" class="bg-slate-100 text-slate-500 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition text-xs"><i class="fas fa-gavel"></i></button>`
        : `<span class="text-slate-300 text-xs">—</span>`;

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-5">
          <div class="flex items-center space-x-3">
            <img src="${d.photo_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(d.name)}" class="w-9 h-9 rounded-xl object-cover">
            <div>
              <p class="font-black text-slate-800">${d.name}</p>
              <p class="text-[10px] text-slate-400">${d.phone}</p>
            </div>
          </div>
        </td>
        <td class="px-8 py-5 font-bold text-slate-700">${d.plate_number || "-"}</td>
        <td class="px-8 py-5 font-black text-emerald-600 italic">Rp ${numberFormat(d.balance || 0)}</td>
        <td class="px-8 py-5">${statusBadge}</td>
        <td class="px-8 py-5 text-center">${actionButtons}</td>
      </tr>`;
  }).join("");
}

/**
 * Global action for verifying/rejecting a driver.
 */
window.actionDriver = async (id, status) => {
  if (!confirm(`Yakin ingin mengubah status driver menjadi ${status}?`)) return;
  try {
    const result = await verifyDriverApi(id, status);
    if (result.success) {
      window.showToast?.(result.message, "success");
      loadDriversData(); // Reload both tables
    }
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};

window.toggleVerifikasiTable = () => {
  const wrapper = document.getElementById("verifikasi-table-wrapper");
  const label = document.getElementById("verifikasi-toggle-label");
  const icon = document.getElementById("verifikasi-toggle-icon");
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

window.toggleDriversTable = () => {
  const wrapper = document.getElementById("drivers-table-wrapper");
  const label = document.getElementById("drivers-toggle-label");
  const icon = document.getElementById("drivers-toggle-icon");
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
