/**
 * ui/commission.ui.js
 * Logic for rendering commission billing queue and verification.
 */

import { fetchCommissionQueueFromApi, verifyCommissionPaymentApi } from "../api/commission.api.js";
import { numberFormat } from "../utils/format.js";

/**
 * Load and render the commission verification queue.
 */
export async function loadCommissionData() {
  try {
    const result = await fetchCommissionQueueFromApi();
    renderCommissionQueue(result.data);
    updateCommissionStats(result.total_unpaid);
  } catch (e) {
    console.error("Commission Load Error:", e);
  }
}

function renderCommissionQueue(bills) {
  const tbody = document.getElementById("commission-queue-table");
  if (!tbody) return;

  if (bills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="px-8 py-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">Tidak ada setoran masuk</td></tr>`;
    return;
  }

  tbody.innerHTML = bills.map((b) => {
    const proofLink = b.proof_url 
      ? `<div class="relative group cursor-pointer" onclick="window.open('${b.proof_url}', '_blank')">
           <img src="${b.proof_url}" class="w-12 h-12 object-cover rounded-xl border-2 border-amber-100 group-hover:border-amber-400 transition-all shadow-sm" />
           <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center transition-opacity">
             <i class="fas fa-search-plus text-white text-[10px]"></i>
           </div>
         </div>`
      : `<div class="w-12 h-12 bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-100 text-[8px] font-black text-slate-300 uppercase">
           <i class="fas fa-image-slash mb-0.5"></i> No File
         </div>`;

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-6">
          <p class="font-black text-slate-800 text-sm mb-1">${b.driver_name}</p>
          <p class="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">#${b.bill_number}</p>
        </td>
        <td class="px-8 py-6 font-black text-slate-700">Rp ${numberFormat(b.amount)}</td>
        <td class="px-8 py-6">${proofLink}</td>
        <td class="px-8 py-6">
          <div class="flex justify-center gap-2">
            <button onclick="window.verifyCommission(${b.id}, 'approve')" class="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition active:scale-90 shadow-md" title="Setujui"><i class="fas fa-check text-[10px]"></i></button>
            <button onclick="window.verifyCommission(${b.id}, 'reject')" class="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition active:scale-90 shadow-md" title="Tolak"><i class="fas fa-times text-[10px]"></i></button>
          </div>
        </td>
      </tr>`;
  }).join("");
}

function updateCommissionStats(totalUnpaid) {
  const el = document.getElementById("total-commission-debt");
  if (el) el.innerText = totalUnpaid;
}

window.verifyCommission = async (id, action) => {
  const confirmMsg = action === 'approve' 
    ? "Pastikan uang sudah masuk ke rekening. Lanjutkan?" 
    : "Tolak bukti transfer ini? Driver harus upload ulang.";
    
  if (!confirm(confirmMsg)) return;

  try {
    const result = await verifyCommissionPaymentApi(id, action);
    if (result.success) {
      window.showToast?.(result.message, "success");
      loadCommissionData();
      // Reload stats and drivers to update potential debt status
      window.dispatchEvent(new CustomEvent('app:reload-stats'));
      window.dispatchEvent(new CustomEvent('app:reload-drivers'));
    }
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
