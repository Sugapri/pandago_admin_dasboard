/**
 * ui/passengers.ui.js
 * Logic for the passenger table.
 */

import { fetchPassengersFromApi } from "../api/passengers.api.js";
import { numberFormat } from "../utils/format.js";

export async function loadPassengersData() {
  try {
    const passengers = await fetchPassengersFromApi();
    const tbody = document.querySelector("#passengers tbody");
    if (!tbody) return;

    tbody.innerHTML = passengers.map((p) => `
      <tr>
        <td class="px-8 py-6">
          <div class="flex items-center space-x-3">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}" class="w-8 h-8 rounded-lg">
            <div>
              <p class="font-black text-slate-800">${p.name}</p>
              <p class="text-[10px] text-slate-400">${p.phone || '-'}</p>
            </div>
          </div>
        </td>
        <td class="px-8 py-6 font-black text-emerald-600 italic">Rp ${numberFormat(p.balance || 0)}</td>
        <td class="px-8 py-6">
          <div class="flex justify-center space-x-2">
            <button class="bg-slate-100 text-slate-400 p-2 rounded-lg hover:bg-rose-500 hover:text-white transition"><i class="fas fa-ban"></i></button>
            <button class="bg-slate-100 text-slate-400 p-2 rounded-lg hover:bg-blue-500 hover:text-white transition"><i class="fas fa-wallet"></i></button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch (e) {
    console.error("Passengers Error:", e);
  }
}

window.togglePassengersTable = () => {
  const wrapper = document.getElementById("passengers-table-wrapper");
  const label = document.getElementById("passengers-toggle-label");
  const icon = document.getElementById("passengers-toggle-icon");
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
