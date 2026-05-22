/**
 * ui/chats.ui.js
 * UI Logic for Chat Monitoring.
 */

import { fetchAllChatsFromApi } from "../api/chats.api.js";

let allChats = [];

export async function loadChatsData() {
  try {
    const chats = await fetchAllChatsFromApi();
    allChats = chats;
    const tbody = document.getElementById("chats-table-body");
    if (!tbody) return;

    if (chats.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="px-8 py-10 text-center text-slate-400 font-bold italic">Belum ada percakapan terekam</td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = chats
      .map(
        (chat) => `
      <tr class="hover:bg-slate-50/50 transition">
        <td class="px-8 py-6">
          <span class="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black tracking-tighter">ORD-${chat.order_id}</span>
        </td>
        <td class="px-8 py-6">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-slate-700">${chat.user_name}</span>
            <i class="fas fa-arrow-right text-[10px] text-slate-300"></i>
            <span class="text-xs font-bold text-emerald-600">${chat.driver_name}</span>
          </div>
        </td>
        <td class="px-8 py-6">
          <p class="text-xs text-slate-500 italic truncate max-w-[250px]">"${chat.last_message || "-"}"</p>
        </td>
        <td class="px-8 py-6">
           <span class="text-[10px] font-bold text-slate-400 uppercase">${chat.messages_count} Pesan</span>
        </td>
        <td class="px-8 py-6 text-center">
          <button onclick="window.viewChatDetail(${chat.order_id})" class="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl shadow-lg active:scale-90 transition">
            <i class="fas fa-eye text-sm"></i>
          </button>
        </td>
      </tr>
    `,
      )
      .join("");
  } catch (e) {
    console.error("Chats UI Error:", e);
  }
}

window.viewChatDetail = (orderId) => {
  const chat = allChats.find((c) => c.order_id === orderId);
  if (!chat) return;

  const modal = document.getElementById("chat-detail-modal");
  const container = document.getElementById("chat-messages-container");
  const subtitle = document.getElementById("chat-modal-subtitle");

  subtitle.textContent = `Order #${chat.order_id} • ${chat.user_name} (User) & ${chat.driver_name} (Driver)`;

  container.innerHTML = chat.messages
    .map(
      (m) => `
    <div class="flex ${m.sender_type === "user" ? "justify-start" : "justify-end"}">
      <div class="max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
        m.sender_type === "user"
          ? "bg-white border text-slate-700 rounded-tl-none"
          : "bg-emerald-600 text-white rounded-tr-none"
      }">
        <p class="text-[9px] font-black uppercase opacity-60 mb-1">${m.sender_type === "user" ? chat.user_name : chat.driver_name}</p>
        <p class="text-sm font-medium leading-relaxed">${m.text}</p>
        <p class="text-[8px] text-right mt-1 opacity-50">${new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
      </div>
    </div>
  `,
    )
    .join("");

  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.closeChatModal = () => {
  const modal = document.getElementById("chat-detail-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
};

window.toggleChatsTable = () => {
  const wrapper = document.getElementById("chats-table-wrapper");
  const label = document.getElementById("chats-toggle-label");
  const icon = document.getElementById("chats-toggle-icon");
  const isHidden = wrapper.classList.contains("hidden");

  if (isHidden) {
    wrapper.classList.remove("hidden");
    if (label) label.textContent = "Sembunyikan";
    if (icon) icon.style.transform = "rotate(180deg)";
    // Muat data saat pertama kali dibuka
    loadChatsData();
  } else {
    wrapper.classList.add("hidden");
    if (label) label.textContent = "Tampilkan";
    if (icon) icon.style.transform = "rotate(0deg)";
  }
};
