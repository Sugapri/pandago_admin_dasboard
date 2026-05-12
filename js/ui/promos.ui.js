/**
 * ui/promos.ui.js
 * Logic for Promo management: rendering, creating, and toggling.
 */

import { fetchPromosApi, createPromoApi, deletePromoApi } from "../api/promos.api.js";
import { numberFormat } from "../utils/format.js";

export async function loadPromosData() {
  try {
    const promos = await fetchPromosApi();
    renderPromos(promos);
    
    // Update badge
    const badge = document.getElementById("promo-count-badge");
    if (badge) badge.textContent = `${promos.length} Aktif`;
  } catch (e) {
    console.error("Promos Error:", e);
  }
}

function renderPromos(promos) {
  const tbody = document.getElementById("promo-tbody");
  const empty = document.getElementById("promo-empty");
  if (!tbody) return;

  if (!promos.length) {
    tbody.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  tbody.innerHTML = promos.map(p => `
    <tr class="hover:bg-slate-50/80 transition">
      <td class="px-8 py-5">
        <p class="font-black text-rose-600 uppercase italic text-sm">${p.code}</p>
        <p class="text-[9px] text-slate-400 mt-0.5">Dibuat: ${new Date(p.created_at).toLocaleDateString()}</p>
      </td>
      <td class="px-8 py-5">
        <p class="font-bold text-slate-800">
          ${p.type === 'percentage' ? `${p.value}%` : `Rp ${numberFormat(p.value)}`}
        </p>
        <p class="text-[9px] text-slate-400 uppercase">OFF ORDER</p>
      </td>
      <td class="px-8 py-5">
        <span class="bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase italic">Aktif</span>
      </td>
      <td class="px-8 py-5 text-center">
        <button onclick="window.deletePromo(${p.id})" class="text-slate-300 hover:text-rose-500 transition active:scale-90 p-2">
          <i class="fas fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

window.togglePromosTable = () => {
  const wrapper = document.getElementById("promos-table-wrapper");
  const label = document.getElementById("promos-toggle-label");
  const icon = document.getElementById("promos-toggle-icon");
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

window.createPromo = async () => {
  const code = document.getElementById("promo-code").value.trim();
  const type = document.getElementById("promo-type").value;
  const value = document.getElementById("promo-value").value;

  if (!code || !value) {
    window.showToast?.("Harap isi kode dan nilai promo!", "error");
    return;
  }

  try {
    const result = await createPromoApi({ code, type, value: Number(value) });
    window.showToast?.("✅ Promo berhasil dibuat!", "success");
    
    // Clear inputs
    document.getElementById("promo-code").value = "";
    document.getElementById("promo-value").value = "";
    
    loadPromosData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};

window.deletePromo = async (id) => {
  if (!confirm("Hapus promo ini?")) return;
  try {
    await deletePromoApi(id);
    window.showToast?.("🗑️ Promo telah dihapus", "success");
    loadPromosData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
