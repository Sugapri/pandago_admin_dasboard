/**
 * config.js
 * Central configuration — satu tempat untuk semua konstanta aplikasi.
 */

export const API_BASE_URL = "http://localhost:8000/api/admin";

/**
 * Global headers for API requests.
 */
export function getHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
  };
}

export const MAP_CONFIG = {
  style:
    "https://api.maptiler.com/maps/019dc480-573f-7d43-8223-7de32a1fd981/style.json?key=2jFlG7RFgQk3dOfFzOM9",
  center: [112.7521, -7.2575], // [lng, lat] — Surabaya
  zoom: 12,
};

export const POLL_INTERVALS = {
  stats: 10_000, // 10 detik
  drivers: 5_000, // 5 detik
  driversList: 30_000, // 30 detik
  orders: 15_000, // 15 detik
};
