/**
 * ui/dispatch.ui.js
 * Logic for AI Dispatcher Control: toggling, config updates, and log simulation.
 */

import { toggleDispatchSystemApi, updateDispatchConfigApi } from "../api/dispatch.api.js";

export function initDispatchUi() {
  // Add some initial log entries for effect
  addDispatchLog("System Initialized", "Waiting for incoming orders...");
}

window.toggleAiDispatch = () => {
  const wrapper = document.getElementById("ai-dispatch-wrapper");
  const label = document.getElementById("ai-dispatch-toggle-label");
  const icon = document.getElementById("ai-dispatch-toggle-icon");
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

window.toggleDispatchSystem = async () => {
  const toggle = document.getElementById("dispatch-master-toggle");
  const dot = document.getElementById("dispatch-status-dot");
  const text = document.getElementById("dispatch-status-text");
  const isEnabled = toggle.checked;

  try {
    await toggleDispatchSystemApi(isEnabled);
    
    if (isEnabled) {
      dot.className = "w-2 h-2 rounded-full bg-emerald-500 animate-pulse";
      text.textContent = "Sistem Aktif";
      text.className = "text-[10px] font-black text-emerald-600 uppercase italic";
      addDispatchLog("System Enabled", "AI Auto-matching is now processing orders.");
    } else {
      dot.className = "w-2 h-2 rounded-full bg-slate-400";
      text.textContent = "Sistem Nonaktif";
      text.className = "text-[10px] font-black text-slate-400 uppercase italic";
      addDispatchLog("System Disabled", "Manual dispatch mode engaged.");
    }
    
    window.showToast?.(`AI Dispatch ${isEnabled ? 'Dihidupkan' : 'Dimatikan'}`, "success");
  } catch (e) {
    toggle.checked = !isEnabled; // Revert
    window.showToast?.(e.message, "error");
  }
};

export function addDispatchLog(title, message) {
  const container = document.getElementById("dispatch-logs");
  if (!container) return;

  const log = document.createElement("div");
  log.className = "text-[10px] text-slate-400 border-l-2 border-blue-500 pl-3 py-1 animate-fadeIn";
  log.innerHTML = `
    <p class="font-bold text-slate-300">${title}</p>
    <p class="opacity-50">${message}</p>
  `;

  container.prepend(log);
  
  // Keep only last 20 logs
  if (container.children.length > 20) {
    container.lastElementChild.remove();
  }
}
