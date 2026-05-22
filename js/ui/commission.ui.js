/**
 * ui/commission.ui.js
 * Commission billing queue: driver cards, detail modal, and server sync.
 */

import {
    fetchCommissionQueueFromApi,
    verifyCommissionPaymentApi,
} from "../api/commission.api.js";
import { numberFormat } from "../utils/format.js";

let _currentBillId = null; // Track which bill is open in modal

// ── Main Loader ──────────────────────────────────────────────────────────────

export async function loadCommissionData() {
  try {
    const result = await fetchCommissionQueueFromApi();
    renderDriverSummaryCards(result.data);
    renderCommissionQueue(result.data);
    updateCommissionStats(result.total_unpaid);
    updateSidebarBadge(result.data);
  } catch (e) {
    console.error("Commission Load Error:", e);
    const tbody = document.getElementById("commission-queue-table");
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="px-8 py-10 text-center text-rose-400 font-bold italic uppercase text-xs">
        <i class="fas fa-exclamation-triangle mr-2"></i>Gagal memuat data. Periksa koneksi server.</td></tr>`;
    }
  }
}

// ── Sidebar Badge ────────────────────────────────────────────────────────────

function updateSidebarBadge(bills) {
  const badge = document.getElementById("commission-badge");
  if (!badge) return;
  const count = bills.filter((b) => b.status === "pending_verification").length;
  if (count > 0) {
    badge.textContent = count > 9 ? "9+" : count;
    badge.classList.remove("hidden");
    badge.classList.add("flex");
  } else {
    badge.classList.add("hidden");
    badge.classList.remove("flex");
  }
}

// ── Driver Summary Cards ─────────────────────────────────────────────────────

function renderDriverSummaryCards(bills) {
  const container = document.getElementById("driver-pending-cards");
  const countEl = document.getElementById("commission-need-action-count");
  if (!container) return;

  const pending = bills.filter((b) => b.status === "pending_verification");
  const unpaid = bills.filter((b) => b.status === "unpaid");
  if (countEl) countEl.textContent = pending.length;

  if (bills.length === 0) {
    container.innerHTML = `<div class="text-[10px] text-slate-400 italic py-1">✅ Tidak ada tagihan yang perlu ditindaklanjuti</div>`;
    return;
  }

  const pendingCards = pending
    .map(
      (b) => `
    <button onclick="window.openCommissionDetailModal(${b.id})"
      class="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-3 py-2 rounded-xl transition active:scale-95 shadow-md">
      <div class="relative">
        <div class="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
          <i class="fas fa-id-badge text-[10px]"></i>
        </div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-rose-500 animate-ping"></div>
        <div class="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-rose-500"></div>
      </div>
      <div class="text-left">
        <p class="text-[10px] font-black leading-tight">${b.driver_name}</p>
        <p class="text-[8px] opacity-70 uppercase font-bold">Klik → Verifikasi</p>
      </div>
      <span class="text-[8px] font-black bg-white/20 px-1.5 py-0.5 rounded-full">Rp ${numberFormat(b.amount_remaining)}</span>
    </button>
  `,
    )
    .join("");

  const unpaidCards = unpaid
    .map(
      (b) => `
    <button onclick="window.openCommissionDetailModal(${b.id})"
      class="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-2 rounded-xl shadow-sm transition active:scale-95">
      <div class="w-7 h-7 bg-slate-300 rounded-lg flex items-center justify-center">
        <i class="fas fa-id-badge text-[10px]"></i>
      </div>
      <div class="text-left">
        <p class="text-[10px] font-black leading-tight">${b.driver_name}</p>
        <p class="text-[8px] opacity-60 uppercase font-bold">Belum Bayar</p>
      </div>
      <span class="text-[8px] font-black bg-slate-300 px-1.5 py-0.5 rounded-full">Rp ${numberFormat(b.amount_remaining)}</span>
    </button>
  `,
    )
    .join("");

  container.innerHTML =
    pendingCards + unpaidCards ||
    `<div class="text-[10px] text-slate-400 italic py-1">✅ Semua tagihan telah ditangani</div>`;
}

// ── Commission Table ─────────────────────────────────────────────────────────

function getStatusBadge(status) {
  const map = {
    pending_verification: `<span class="px-2 py-1 rounded-full text-[9px] font-black bg-amber-100 text-amber-700 uppercase flex items-center gap-1 w-fit"><i class="fas fa-clock"></i> Menunggu Verifikasi</span>`,
    unpaid: `<span class="px-2 py-1 rounded-full text-[9px] font-black bg-slate-100 text-slate-500 uppercase w-fit">Belum Bayar</span>`,
    paid: `<span class="px-2 py-1 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-700 uppercase w-fit">✅ Lunas</span>`,
  };
  return (
    map[status] || `<span class="text-[9px] text-slate-400">${status}</span>`
  );
}

function renderCommissionQueue(bills) {
  const tbody = document.getElementById("commission-queue-table");
  if (!tbody) return;

  if (!bills || bills.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-8 py-10 text-center text-slate-400 font-bold italic uppercase tracking-widest text-xs">Tidak ada tagihan yang menunggu</td></tr>`;
    return;
  }

  tbody.innerHTML = bills
    .map((b) => {
      const uploadedAt = b.updated_at
        ? new Date(b.updated_at).toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-";
      const proofThumb = b.proof_url
        ? `<img src="${b.proof_url}" class="w-14 h-14 object-cover rounded-xl border-2 border-amber-200 shadow cursor-pointer hover:scale-105 transition"
             onclick="window.openCommissionDetailModal(${b.id})"
             onerror="this.outerHTML='<div class=\\'w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-200 text-amber-400 cursor-pointer\\' onclick=\\'window.openCommissionDetailModal(${b.id})\\'><i class=\\'fas fa-file-image text-xl\\'></i></div>'" />`
        : `<div class="w-14 h-14 bg-slate-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-slate-200 text-[8px] font-black text-slate-300 uppercase gap-1">
           <i class="fas fa-upload"></i><span>Kosong</span></div>`;

      const canVerify = b.status === "pending_verification" && b.proof_url;
      const actionBtns = canVerify
        ? `<button onclick="window.openCommissionDetailModal(${b.id})"
           class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-black transition active:scale-90 shadow flex items-center gap-1">
           <i class="fas fa-eye"></i> Review
         </button>`
        : `<div class="text-center text-slate-300 text-[9px] font-bold italic uppercase">Menunggu<br/>bukti driver</div>`;

      const rowBg =
        b.status === "pending_verification"
          ? "border-l-4 border-l-amber-400 bg-amber-50/30"
          : "";
      return `
      <tr class="hover:bg-slate-50 transition ${rowBg}">
        <td class="px-8 py-5">
          <p class="font-black text-slate-800 text-sm mb-0.5">${b.driver_name}</p>
          <p class="text-[10px] text-slate-400 font-bold uppercase">#${b.bill_number}</p>
          <p class="text-[9px] text-slate-300 mt-0.5">${uploadedAt}</p>
        </td>
        <td class="px-8 py-5 space-y-0.5">
          <p class="text-xs font-black text-slate-700">Total: Rp ${numberFormat(b.amount)}</p>
          <p class="text-[10px] font-bold text-emerald-600">Dibayar: Rp ${numberFormat(b.amount_paid)}</p>
          <p class="text-[10px] font-bold text-rose-500">Sisa: Rp ${numberFormat(b.amount_remaining)}</p>
        </td>
        <td class="px-8 py-5">${getStatusBadge(b.status)}</td>
        <td class="px-8 py-5">${proofThumb}</td>
        <td class="px-8 py-5 text-center">${actionBtns}</td>
      </tr>`;
    })
    .join("");
}

function updateCommissionStats(totalUnpaid) {
  const el = document.getElementById("total-commission-debt");
  if (el) el.innerText = totalUnpaid;
}

// ── Commission Detail Modal ──────────────────────────────────────────────────

let _billsCache = [];

// Keep a local cache so we can open modals by ID
const _origFetch = loadCommissionData;
export { loadCommissionData };

async function _fetchAndCache() {
  try {
    const result = await fetchCommissionQueueFromApi();
    _billsCache = result.data || [];
    renderDriverSummaryCards(_billsCache);
    renderCommissionQueue(_billsCache);
    updateCommissionStats(result.total_unpaid);
    updateSidebarBadge(_billsCache);
  } catch (e) {
    console.error("Commission Load Error:", e);
  }
}

// Override the exported function to also populate cache
Object.assign(window, {
  _commissionLoadFull: _fetchAndCache,
});

window.openCommissionDetailModal = (billId) => {
  const bill = _billsCache.find((b) => b.id === billId);
  if (!bill) {
    // If no cache yet, refetch first
    fetchCommissionQueueFromApi().then((r) => {
      _billsCache = r.data || [];
      window.openCommissionDetailModal(billId);
    });
    return;
  }
  _currentBillId = billId;
  _populateModal(bill);
  const modal = document.getElementById("commission-detail-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

function _populateModal(bill) {
  const fmt = (v) => `Rp ${numberFormat(v)}`;
  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleString("id-ID", {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "-";

  document.getElementById("cdm-bill-number").textContent =
    `Tagihan #${bill.bill_number} | Driver ID: ${bill.driver_id}`;
  document.getElementById("cdm-driver-name").textContent = bill.driver_name;
  document.getElementById("cdm-driver-id").textContent =
    `Driver ID: ${bill.driver_id}`;
  document.getElementById("cdm-amount-total").textContent = fmt(bill.amount);
  document.getElementById("cdm-amount-paid").textContent = fmt(
    bill.amount_paid,
  );
  document.getElementById("cdm-amount-remaining").textContent = fmt(
    bill.amount_remaining,
  );
  document.getElementById("cdm-billed-at").textContent = fmtDate(
    bill.billed_at,
  );
  document.getElementById("cdm-updated-at").textContent = fmtDate(
    bill.updated_at,
  );

  // Status banner
  const banner = document.getElementById("cdm-status-banner");
  if (bill.status === "pending_verification") {
    banner.className =
      "p-4 flex items-center gap-3 border-b bg-amber-50 border-amber-100";
    banner.innerHTML = `<i class="fas fa-clock text-amber-500 text-xl"></i>
      <div><p class="text-sm font-black text-amber-700">Menunggu Verifikasi Admin</p>
      <p class="text-[10px] text-amber-600">Driver telah upload bukti transfer. Silakan periksa dan konfirmasi.</p></div>`;
  } else if (bill.status === "unpaid") {
    banner.className =
      "p-4 flex items-center gap-3 border-b bg-slate-50 border-slate-100";
    banner.innerHTML = `<i class="fas fa-hourglass-half text-slate-400 text-xl"></i>
      <div><p class="text-sm font-black text-slate-600">Tagihan Belum Dibayar</p>
      <p class="text-[10px] text-slate-400">Driver belum mengupload bukti transfer.</p></div>`;
  }

  // Proof image
  const img = document.getElementById("cdm-proof-img");
  const noProof = document.getElementById("cdm-no-proof");
  const proofLink = document.getElementById("cdm-proof-link");
  if (bill.proof_url) {
    img.src = bill.proof_url;
    img.classList.remove("hidden");
    noProof.classList.add("hidden");
    proofLink.href = bill.proof_url;
    proofLink.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
    noProof.classList.remove("hidden");
    proofLink.classList.add("hidden");
  }

  // Action buttons: only show if pending_verification with proof
  const actionBtns = document.getElementById("cdm-action-buttons");
  if (bill.status === "pending_verification" && bill.proof_url) {
    actionBtns.classList.remove("hidden");
  } else {
    actionBtns.classList.add("hidden");
  }
}

window.closeCommissionDetailModal = () => {
  const modal = document.getElementById("commission-detail-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
  _currentBillId = null;
};

window.commissionModalAction = async (action) => {
  if (!_currentBillId) return;
  const bill = _billsCache.find((b) => b.id === _currentBillId);
  const confirmMsg =
    action === "approve"
      ? `✅ Konfirmasi pembayaran Rp ${numberFormat(bill?.amount_remaining || 0)} dari ${bill?.driver_name}?\n\nUang sudah masuk ke rekening Anda?`
      : `❌ Tolak bukti transfer dari ${bill?.driver_name}?\nDriver akan diminta upload ulang.`;

  if (!confirm(confirmMsg)) return;

  // Disable buttons during processing
  const approveBtn = document.getElementById("cdm-approve-btn");
  const rejectBtn = document.getElementById("cdm-reject-btn");
  if (approveBtn) {
    approveBtn.disabled = true;
    approveBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Memproses...`;
  }
  if (rejectBtn) {
    rejectBtn.disabled = true;
  }

  try {
    const result = await verifyCommissionPaymentApi(_currentBillId, action);
    if (result.success) {
      window.showToast?.(result.message, "success");
      window.closeCommissionDetailModal();
      // Refetch everything
      await _fetchAndCache();
      window.dispatchEvent(new CustomEvent("app:reload-stats"));
      window.dispatchEvent(new CustomEvent("app:reload-drivers"));
    }
  } catch (e) {
    window.showToast?.(
      e.message || "Terjadi kesalahan saat proses verifikasi",
      "error",
    );
    if (approveBtn) {
      approveBtn.disabled = false;
      approveBtn.innerHTML = `<i class="fas fa-check-circle"></i> Konfirmasi Pembayaran ✅`;
    }
    if (rejectBtn) {
      rejectBtn.disabled = false;
    }
  }
};

// Patch loadCommissionData to also populate _billsCache
const _origExport = loadCommissionData;
// Re-export with cache population
export async function _loadCommissionWithCache() {
  await _fetchAndCache();
}
