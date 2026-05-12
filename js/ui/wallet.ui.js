/**
 * ui/wallet.ui.js
 * Logic for rendering wallet queue and manual adjustments.
 */

import { fetchWalletQueueFromApi, verifyWalletTransactionApi, manualTopupApi } from "../api/wallet.api.js";
import { numberFormat } from "../utils/format.js";

/**
 * Load and render the wallet transaction queue.
 */
export async function loadWalletData() {
  try {
    const queue = await fetchWalletQueueFromApi();
    renderWalletQueue(queue);
  } catch (e) {
    console.error("Wallet Load Error:", e);
  }
}

function renderWalletQueue(queue) {
  const tbody = document.getElementById("wallet-queue-table");
  if (!tbody) return;

  if (queue.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-8 py-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">Antrian Kosong</td></tr>`;
    return;
  }

  tbody.innerHTML = queue.map((t) => {
    const typeBadge = t.type === 'topup' 
      ? '<span class="text-emerald-600 font-black text-[10px] uppercase tracking-tighter bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">Top-up</span>'
      : '<span class="text-rose-600 font-black text-[10px] uppercase tracking-tighter bg-rose-50 px-2 py-1 rounded-md border border-rose-100">Withdraw</span>';

    const statusBadge = t.status === 'pending'
      ? '<span class="animate-pulse text-amber-600 font-black text-[10px] uppercase italic bg-amber-50 px-2 py-1 rounded-md">Pending</span>'
      : t.status === 'success'
        ? '<span class="text-emerald-600 font-black text-[10px] uppercase bg-emerald-50 px-2 py-1 rounded-md">Success</span>'
        : '<span class="text-rose-600 font-black text-[10px] uppercase bg-rose-50 px-2 py-1 rounded-md">Failed</span>';

    const actions = t.status === 'pending'
      ? `<div class="flex justify-center gap-2">
           <button onclick="window.verifyTransaction(${t.id}, 'approve')" class="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition active:scale-90 shadow-md"><i class="fas fa-check text-[10px]"></i></button>
           <button onclick="window.verifyTransaction(${t.id}, 'reject')" class="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition active:scale-90 shadow-md"><i class="fas fa-times text-[10px]"></i></button>
         </div>`
      : `<div class="text-center text-slate-300 text-[10px] uppercase font-black">— Selesai —</div>`;

    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-6 font-black text-slate-800 text-sm">${t.driver_name}</td>
        <td class="px-8 py-6">${typeBadge}</td>
        <td class="px-8 py-6 font-black text-slate-700">Rp ${numberFormat(t.amount)}</td>
        <td class="px-8 py-6">${statusBadge}</td>
        <td class="px-8 py-6">${actions}</td>
      </tr>`;
  }).join("");
}

/**
 * Handle manual top-up from the UI.
 */
window.submitManualTopup = async () => {
  const driverId = document.getElementById("manual-wallet-driver-id").value;
  const amount = document.getElementById("manual-wallet-amount").value;

  if (!driverId || !amount) {
    window.showToast?.("Isi ID Driver dan Nominal!", "error");
    return;
  }

  try {
    const result = await manualTopupApi(driverId, amount);
    if (result.success) {
      window.showToast?.(result.message, "success");
      document.getElementById("manual-wallet-amount").value = "";
      loadWalletData();
      // Re-trigger global driver data reload to update main table balance
      window.dispatchEvent(new CustomEvent('app:reload-drivers'));
    }
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};

window.verifyTransaction = async (id, action) => {
  if (!confirm(`Yakin ingin ${action} transaksi ini?`)) return;
  try {
    const result = await verifyWalletTransactionApi(id, action);
    if (result.success) {
      window.showToast?.(result.message, "success");
      loadWalletData();
      window.dispatchEvent(new CustomEvent('app:reload-drivers'));
    }
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
