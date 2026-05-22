/**
 * ui/history.ui.js
 * UI Logic for Order History and Evidence Details.
 */

import { API_BASE_URL, getHeaders } from "../config.js";

let allOrders = [];
const MAPTILER_KEY = "2jFlG7RFgQk3dOfFzOM9";

export async function loadOrderHistoryData() {
  try {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Gagal mengambil data history");

    const result = await response.json();
    allOrders = result.data;

    renderHistoryTable(allOrders);
  } catch (e) {
    console.error("History UI Error:", e);
  }
}

function renderHistoryTable(orders) {
  const tbody = document.getElementById("history-table-body");
  if (!tbody) return;

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-8 py-10 text-center text-slate-400 font-bold italic">Belum ada riwayat perjalanan terekam</td></tr>`;
    return;
  }

  tbody.innerHTML = orders
    .map((order) => {
      const statusClass = getStatusClass(order.status);
      const date = new Date(order.created_at).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });

      return `
      <tr class="hover:bg-slate-50 transition">
        <td class="px-8 py-6">
          <div class="flex flex-col gap-1">
            <span class="text-xs font-black text-slate-800 uppercase italic">ORD-${order.id}</span>
            <span class="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full w-fit font-bold">${order.order_type.toUpperCase()}</span>
          </div>
        </td>
        <td class="px-8 py-6">
          <span class="text-xs font-bold text-slate-500">${date}</span>
        </td>
        <td class="px-8 py-6">
          <div class="space-y-1">
            <p class="text-xs font-black text-slate-700"><i class="fas fa-user mr-2 opacity-30"></i>${order.user?.name || "Customer"}</p>
            <p class="text-[10px] font-bold text-emerald-600"><i class="fas fa-id-card-clip mr-2 opacity-50"></i>${order.driver_name || "Mencari..."}</p>
          </div>
        </td>
        <td class="px-8 py-6">
          <div class="space-y-1 max-w-[200px]">
            <p class="text-[10px] font-medium text-slate-500 truncate"><i class="fas fa-map-pin mr-1 text-emerald-500"></i>${order.pickup_address}</p>
            <p class="text-[10px] font-medium text-slate-500 truncate"><i class="fas fa-flag-checkered mr-1 text-rose-500"></i>${order.destination_address}</p>
          </div>
        </td>
        <td class="px-8 py-6">
          <span class="text-xs font-black text-slate-800 italic">Rp ${order.display_price.toLocaleString()}</span>
        </td>
        <td class="px-8 py-6 text-center">
          <button onclick="window.viewOrderDetail(${order.id})" class="bg-indigo-500 hover:bg-slate-800 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition">
            <i class="fas fa-file-invoice text-sm"></i>
          </button>
        </td>
      </tr>
    `;
    })
    .join("");
}

function getStatusClass(status) {
  switch (status) {
    case "completed":
      return "bg-emerald-100 text-emerald-700";
    case "cancelled":
      return "bg-rose-100 text-rose-700";
    case "active":
    case "on_the_way":
    case "at_pickup":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

window.toggleOrderHistoryTable = () => {
  const wrapper = document.getElementById("history-table-wrapper");
  const label = document.getElementById("history-toggle-label");
  const icon = document.getElementById("history-toggle-icon");
  const isHidden = wrapper.classList.contains("hidden");

  if (isHidden) {
    wrapper.classList.remove("hidden");
    label.textContent = "Sembunyikan";
    icon.style.transform = "rotate(180deg)";
    loadOrderHistoryData();
  } else {
    wrapper.classList.add("hidden");
    label.textContent = "Buka History";
    icon.style.transform = "rotate(0deg)";
  }
};

window.viewOrderDetail = (orderId) => {
  const order = allOrders.find((o) => o.id === orderId);
  if (!order) return;

  document.getElementById("order-detail-id").textContent =
    `Invoice ID: INV-${order.id} / ${new Date(order.created_at).toLocaleDateString()}`;
  document.getElementById("detail-type").textContent = order.order_type;
  document.getElementById("detail-distance").textContent =
    `${order.distance_km} KM`;
  document.getElementById("detail-payment").textContent = order.payment_method;
  document.getElementById("detail-pickup").textContent = order.pickup_address;
  document.getElementById("detail-destination").textContent =
    order.destination_address;
  document.getElementById("detail-price-trip").textContent =
    `Rp ${order.display_price.toLocaleString()}`;
  document.getElementById("detail-price-fee").textContent =
    `Rp ${order.app_fee.toLocaleString()}`;
  document.getElementById("detail-price-total").textContent =
    `Rp ${order.display_price.toLocaleString()}`;

  // Status Logic
  const statusEl = document.getElementById("detail-status");
  statusEl.textContent = order.status.toUpperCase();
  statusEl.className = `px-2 py-0.5 rounded-full text-[10px] font-black ${getStatusClass(order.status)}`;

  // Map Evidence Logic
  const mapImg = document.getElementById("detail-map-img");
  const placeholder = document.getElementById("detail-map-placeholder");

  if (order.pickup_lat && order.destination_lat) {
    placeholder.classList.remove("hidden");
    mapImg.classList.add("hidden");

    // MapTiler Static Map with Markers
    const markers = `marker:${order.pickup_lng},${order.pickup_lat};marker:${order.destination_lng},${order.destination_lat}`;
    const staticUrl = `https://api.maptiler.com/maps/basic-v2/static/${markers}/auto/600x400.png?key=${MAPTILER_KEY}`;

    mapImg.src = staticUrl;
    mapImg.onload = () => {
      placeholder.classList.add("hidden");
      mapImg.classList.remove("hidden");
    };
  } else {
    placeholder.classList.remove("hidden");
    mapImg.classList.add("hidden");
    placeholder.innerHTML = `<i class="fas fa-map-marked-slash text-4xl"></i><span class="text-[10px] font-black uppercase">No Coordinates Data</span>`;
  }

  document.getElementById("order-detail-modal").classList.remove("hidden");
  document.getElementById("order-detail-modal").classList.add("flex");
};

window.closeOrderDetailModal = () => {
  document.getElementById("order-detail-modal").classList.add("hidden");
  document.getElementById("order-detail-modal").classList.remove("flex");
};
