/**
 * utils/format.js
 * Pure utility functions — tidak ada DOM, tidak ada side effect.
 */

/**
 * Format angka ke format ribuan Indonesia (titik sebagai pemisah).
 * @param {number|string} x
 * @returns {string} e.g. "15.000"
 */
export function numberFormat(x) {
  const num = parseFloat(x) || 0;
  return new Intl.NumberFormat("id-ID").format(num);
}

/**
 * Format ISO timestamp ke tanggal lokal Indonesia.
 * @param {string|null} iso
 * @returns {string}
 */
export function formatDate(iso) {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Singkat nama menjadi 2 huruf untuk avatar.
 * @param {string} name
 * @returns {string}
 */
export function getInitials(name) {
  return (name || "??").substring(0, 2).toUpperCase();
}
