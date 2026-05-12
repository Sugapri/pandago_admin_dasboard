/**
 * store/state.js
 * Shared mutable application state.
 * Semua module yang perlu akses state import dari sini.
 */

/** MapLibre GL map instance */
export let map = null;

/** Map dari driver.id → maplibregl.Marker instance */
export let driverMarkers = {};

/** Cache semua orders yang sudah di-fetch */
export let allOrders = [];

/** Apakah tabel order sedang visible */
export let orderTableVisible = false;

/** Driver ID yang sedang di-proses di sanction modal */
export let currentSanctionDriverId = null;

// ── Setters ──────────────────────────────────────────────────────────────────

export function setMap(instance) {
  map = instance;
}

export function setAllOrders(orders) {
  allOrders = orders;
}

export function setOrderTableVisible(val) {
  orderTableVisible = val;
}

export function setCurrentSanctionDriverId(id) {
  currentSanctionDriverId = id;
}

export function setDriverMarker(driverId, marker) {
  driverMarkers[driverId] = marker;
}

export function removeDriverMarker(driverId) {
  delete driverMarkers[driverId];
}
