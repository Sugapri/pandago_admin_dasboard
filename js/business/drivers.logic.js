/**
 * business/drivers.logic.js
 * Pure business logic untuk Driver — tidak ada fetch, tidak ada DOM.
 */

/** Status yang termasuk kategori sanksi */
export const SANCTION_STATUSES = ["suspended_temp", "suspended_perm", "terminated"];

/** Status yang termasuk antrian verifikasi */
export const VERIFICATION_STATUSES = ["pending", "verified", "rejected"];

/**
 * Cek apakah driver sedang disanksi.
 * @param {string} status
 * @returns {boolean}
 */
export function isSanctioned(status) {
  return SANCTION_STATUSES.includes(status);
}

/**
 * Hitung jumlah driver dengan status pending.
 * @param {Array} drivers
 * @returns {number}
 */
export function getPendingCount(drivers) {
  return drivers.filter((d) => d.status === "pending").length;
}

/**
 * Filter driver untuk antrian verifikasi (pending/verified/rejected).
 * @param {Array} drivers
 * @returns {Array}
 */
export function getVerificationQueue(drivers) {
  return drivers.filter((d) => VERIFICATION_STATUSES.includes(d.status));
}

/**
 * Filter driver yang sedang online dan punya koordinat valid.
 * @param {Array} drivers
 * @returns {Array}
 */
export function getOnlineDriversWithLocation(drivers) {
  return drivers.filter(
    (d) => d.is_online && d.latitude && d.longitude
  );
}

/**
 * Dapatkan konfigurasi tampilan badge berdasarkan status driver.
 * @param {string} status
 * @returns {{bg: string, text: string, icon: string, label: string}}
 */
export function getDriverStatusConfig(status) {
  const configs = {
    verified:       { bg: "bg-emerald-100", text: "text-emerald-700", icon: "fa-circle-check",   label: "Aktif" },
    pending:        { bg: "bg-amber-100",   text: "text-amber-700",   icon: "fa-clock",          label: "Pending" },
    rejected:       { bg: "bg-slate-100",   text: "text-slate-500",   icon: "fa-circle-xmark",   label: "Ditolak" },
    suspended_temp: { bg: "bg-orange-100",  text: "text-orange-700",  icon: "fa-hourglass-half", label: "Suspend Sementara" },
    suspended_perm: { bg: "bg-rose-100",    text: "text-rose-700",    icon: "fa-ban",            label: "Suspend Permanen" },
    terminated:     { bg: "bg-slate-900",   text: "text-slate-100",   icon: "fa-user-slash",     label: "Putus Mitra" },
  };
  return configs[status] ?? configs.pending;
}

/**
 * Label sanksi yang user-friendly.
 * @param {string} type
 * @returns {string}
 */
export function getSanctionLabel(type) {
  const labels = {
    suspended_temp: "Suspend Sementara",
    suspended_perm: "Suspend Permanen",
    terminated:     "Putus Mitra",
  };
  return labels[type] ?? type;
}
