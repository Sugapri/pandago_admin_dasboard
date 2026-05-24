/**
 * ui/orders.ui.js
 * Logic for monitoring orders: table, toggle, and filtering.
 */

import { fetchOrdersFromApi, resetRevenueApi } from "../api/orders.api.js";
import {
  allOrders,
  orderTableVisible,
  setAllOrders,
  setOrderTableVisible,
} from "../store/state.js";
import { numberFormat } from "../utils/format.js";

const STATUS_MAP = {
  pending: {
    bg: "bg-amber-100",
    text: "text-amber-700",
    label: "Mencari Driver",
  },
  active: { bg: "bg-blue-100", text: "text-blue-700", label: "Aktif" },
  at_pickup: {
    bg: "bg-indigo-100",
    text: "text-indigo-700",
    label: "Di Penjemputan",
  },
  on_the_way: {
    bg: "bg-violet-100",
    text: "text-violet-700",
    label: "Dalam Perjalanan",
  },
  completed: {
    bg: "bg-emerald-100",
    text: "text-emerald-700",
    label: "Selesai",
  },
  cancelled: { bg: "bg-rose-100", text: "text-rose-700", label: "Dibatalkan" },
};

const ORDER_TYPE_ICON = {
  ride: "fa-motorcycle",
  car: "fa-car",
  food: "fa-utensils",
  send: "fa-box",
  shop: "fa-bag-shopping",
};

export async function loadOrdersData() {
  try {
    const data = await fetchOrdersFromApi();
    setAllOrders(data);

    // Update badge count
    const badge = document.getElementById("order-count-badge");
    if (badge) badge.textContent = `${data.length} Order`;

    filterAndRenderOrders();
  } catch (e) {
    console.error("Orders Error:", e);
  }
}

export function filterAndRenderOrders() {
  const filter = document.getElementById("order-status-filter")?.value;
  const filtered = filter
    ? allOrders.filter((o) => o.status === filter)
    : allOrders;
  renderOrderRows(filtered);
}

function renderOrderRows(orders) {
  const tbody = document.getElementById("order-tbody");
  const empty = document.getElementById("order-empty");
  if (!tbody) return;

  if (!orders.length) {
    tbody.innerHTML = "";
    empty?.classList.remove("hidden");
    return;
  }
  empty?.classList.add("hidden");

  tbody.innerHTML = orders
    .map((o) => {
      const sc = STATUS_MAP[o.status] || {
        bg: "bg-slate-100",
        text: "text-slate-500",
        label: o.status,
      };
      const priceValue =
        o.display_price > 0 ? o.display_price : o.estimated_price || 0;
      const typeIcon = ORDER_TYPE_ICON[o.order_type] || "fa-route";

      return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-5">
          <p class="font-black text-emerald-600 uppercase italic">#ORD-${o.id}</p>
          <p class="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1"><i class="fas ${typeIcon}"></i> ${o.order_type || "-"}</p>
        </td>
        <td class="px-8 py-5">
          <p class="font-bold text-slate-800">${o.user?.name || "-"}</p>
          <p class="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]">→ ${o.destination_address || "-"}</p>
          ${o.driver_name ? `<p class="text-[9px] text-emerald-600 mt-0.5"><i class="fas fa-motorcycle mr-1"></i>${o.driver_name}</p>` : ""}
        </td>
        <td class="px-8 py-5">
          <div class="flex items-baseline gap-1">
            <span class="font-black text-slate-800 italic">Rp ${numberFormat(priceValue)}</span>
            ${o.is_price_estimated ? '<span class="text-[9px] text-amber-500 font-bold ml-1">~Estimasi</span>' : ""}
          </div>
          ${o.app_fee > 0 ? `<p class="text-[9px] text-slate-400 mt-0.5">Platform: Rp ${numberFormat(o.app_fee)} · Driver: Rp ${numberFormat(o.driver_total)}</p>` : ""}
        </td>
        <td class="px-8 py-5">
          <span class="inline-flex items-center gap-1.5 ${sc.bg} ${sc.text} text-[10px] font-black px-3 py-1.5 rounded-full uppercase">${sc.label}</span>
        </td>
        <td class="px-8 py-5 text-center">
          ${
            o.driver_id && o.driver_name
              ? `
            <button onclick="window.openSanctionModal(${o.driver_id}, '${o.driver_name.replace(/'/g, "\\'")}')"
              class="bg-rose-500/20 text-rose-600 p-2.5 rounded-xl shadow-md hover:bg-rose-500 hover:text-white transition active:scale-90"
              title="Sanksi Driver">
              <i class="fas fa-gavel text-sm"></i>
            </button>`
              : `<span class="text-slate-300 text-xs">—</span>`
          }
        </td>
      </tr>`;
    })
    .join("");
}

// Exposed to window
window.toggleOrderTable = () => {
  const wrapper = document.getElementById("order-table-wrapper");
  const label = document.getElementById("order-toggle-label");
  const icon = document.getElementById("order-toggle-icon");
  const newVal = !orderTableVisible;
  setOrderTableVisible(newVal);

  if (newVal) {
    wrapper?.classList.remove("hidden");
    if (label) label.textContent = "Sembunyikan";
    if (icon) icon.style.transform = "rotate(180deg)";
  } else {
    wrapper?.classList.add("hidden");
    if (label) label.textContent = "Tampilkan";
    if (icon) icon.style.transform = "rotate(0deg)";
  }
};

window.filterOrders = () => {
  filterAndRenderOrders();
  if (!orderTableVisible) window.toggleOrderTable();
};

window.resetRevenue = async () => {
  if (
    !confirm(
      "PERINGATAN: Ini akan menghapus SELURUH data order/pendapatan secara permanen. Anda yakin?",
    )
  )
    return;
  try {
    const result = await resetRevenueApi();
    window.showToast?.("✅ " + result.message, "success");
    loadOrdersData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
