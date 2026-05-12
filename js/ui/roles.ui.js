/**
 * ui/roles.ui.js
 * Logic for Admin Role Management: rendering, adding staff, and toggling.
 */

import { fetchAdminsApi, createAdminApi, deleteAdminApi } from "../api/roles.api.js";

const ROLE_CONFIG = {
  super_admin: { label: "Super Admin", bg: "bg-slate-900", text: "text-white" },
  finance:     { label: "Finance",     bg: "bg-emerald-100", text: "text-emerald-700" },
  moderator:   { label: "Moderator",   bg: "bg-blue-100",    text: "text-blue-700" },
};

export async function loadRolesData() {
  try {
    const admins = await fetchAdminsApi();
    renderAdmins(admins);
    
    const badge = document.getElementById("admin-count-badge");
    if (badge) badge.textContent = `${admins.length} Staff`;
  } catch (e) {
    console.error("Roles Error:", e);
    // Fallback if API not implemented
    renderAdmins([
      { id: 1, name: "Super Admin (Owner)", role: "super_admin", last_active: "Sekarang" }
    ]);
  }
}

function renderAdmins(admins) {
  const tbody = document.getElementById("roles-tbody");
  if (!tbody) return;

  tbody.innerHTML = admins.map(a => {
    const rc = ROLE_CONFIG[a.role] || ROLE_CONFIG.moderator;
    return `
      <tr class="hover:bg-slate-50/80 transition">
        <td class="px-8 py-5">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
              ${(a.name || "??").substring(0, 2)}
            </div>
            <p class="font-black text-slate-800 text-sm">${a.name}</p>
          </div>
        </td>
        <td class="px-8 py-5">
          <span class="${rc.bg} ${rc.text} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter italic">
            ${rc.label}
          </span>
        </td>
        <td class="px-8 py-5 text-[10px] font-bold text-slate-400">
          ${a.last_active || "—"}
        </td>
        <td class="px-8 py-5 text-center">
          ${a.role !== 'super_admin' ? `
            <button onclick="window.deleteAdmin(${a.id})" class="text-slate-300 hover:text-rose-500 transition active:scale-90 p-2">
              <i class="fas fa-user-minus"></i>
            </button>
          ` : '<span class="text-[9px] text-slate-300 font-bold uppercase italic">Protected</span>'}
        </td>
      </tr>
    `;
  }).join("");
}

window.toggleRolesTable = () => {
  const wrapper = document.getElementById("roles-table-wrapper");
  const label = document.getElementById("roles-toggle-label");
  const icon = document.getElementById("roles-toggle-icon");
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

window.addAdmin = async () => {
  const name = document.getElementById("admin-name").value.trim();
  const role = document.getElementById("admin-role").value;

  if (!name) {
    window.showToast?.("Harap isi nama staff!", "error");
    return;
  }

  try {
    await createAdminApi({ name, role });
    window.showToast?.("✅ Admin baru berhasil ditambahkan", "success");
    document.getElementById("admin-name").value = "";
    loadRolesData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};

window.deleteAdmin = async (id) => {
  if (!confirm("Hapus hak akses staff ini?")) return;
  try {
    await deleteAdminApi(id);
    window.showToast?.("🗑️ Hak akses dicabut", "success");
    loadRolesData();
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
