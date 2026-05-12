/**
 * ui/map.ui.js
 * Logic for rendering the map and markers.
 */

import { MAP_CONFIG } from "../config.js";
import {
  driverMarkers,
  map,
  removeDriverMarker,
  setDriverMarker,
  setMap,
} from "../store/state.js";

/**
 * Inisialisasi peta Maptiler.
 */
export function initMap() {
  console.log("🗺️ Initializing Map with config:", MAP_CONFIG);

  if (typeof maplibregl === "undefined") {
    console.error("❌ MapLibre GL JS is not loaded!");
    return;
  }

  const container = document.getElementById("map");
  if (!container) {
    console.error("❌ Map container element (#map) not found in DOM!");
    return;
  }

  try {
    const mapInstance = new maplibregl.Map({
      container: "map",
      style: MAP_CONFIG.style,
      center: MAP_CONFIG.center,
      zoom: MAP_CONFIG.zoom,
    });
    console.log("✅ Map instance created successfully.");

    // Add navigation controls (zoom, rotate)
    mapInstance.addControl(new maplibregl.NavigationControl(), "top-right");

    // Add fullscreen control
    mapInstance.addControl(new maplibregl.FullscreenControl());

    // Add scale control
    mapInstance.addControl(
      new maplibregl.ScaleControl({ maxWidth: 80, unit: "metric" }),
    );

    setMap(mapInstance);
  } catch (error) {
    console.error("❌ Map initialization failed:", error);
  }
}

/**
 * Update marker driver di peta.
 * Hanya tampilkan driver yang online dan memiliki koordinat valid (berada di Surabaya / sekitarnya).
 * @param {Array} drivers
 */
export function updateMapMarkers(drivers) {
  if (!map) return;

  const onlineDriversWithLocation = drivers.filter(
    (d) => d.is_online && d.latitude && d.longitude,
  );

  const activeDriverIds = new Set();

  onlineDriversWithLocation.forEach((driver) => {
    const lng = parseFloat(driver.longitude);
    const lat = parseFloat(driver.latitude);
    activeDriverIds.add(driver.id);

    if (driverMarkers[driver.id]) {
      // Update existing marker position
      driverMarkers[driver.id].setLngLat([lng, lat]);
    } else {
      // Create custom HTML element for marker
      const el = document.createElement("div");
      el.className = "relative group";
      el.innerHTML = `
        <div class="flex flex-col items-center">
          <!-- Label ID & Nama (Floating above) -->
          <div class="bg-slate-800 text-white px-2 py-1 rounded-md shadow-lg mb-1 pointer-events-none whitespace-nowrap">
            <span class="text-[9px] font-black text-emerald-400">#${driver.id}</span>
            <span class="text-[10px] font-bold ml-1">${driver.name}</span>
          </div>
          
          <!-- Circle Icon with Person Pin (Google Material Symbols) -->
          <div class="w-9 h-9 bg-emerald-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white relative active:scale-95 transition-transform">
             <span class="material-symbols-outlined text-[24px]">person_pin_circle</span>
             <!-- Subtle pulse effect -->
             <div class="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
          </div>
        </div>
      `;

      // Create new marker with custom element
      const popup = new maplibregl.Popup({ offset: 35 }).setHTML(`
        <div class="p-3">
          <div class="flex items-center gap-3 border-b pb-2 mb-2">
            <div class="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 font-black">
              ${driver.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
               <p class="font-black text-slate-800 text-sm">${driver.name}</p>
               <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: #${driver.id}</p>
            </div>
          </div>
          <p class="text-xs text-slate-500">Plat: <span class="font-bold text-slate-700">${driver.plate_number}</span></p>
          <div class="mt-2 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="text-[10px] uppercase font-black text-emerald-600 italic">Online & Active</span>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom", // Ensure it sits exactly on the coordinates
      })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      setDriverMarker(driver.id, marker);
    }
  });

  // Hapus marker untuk driver yang sudah tidak aktif/offline
  Object.keys(driverMarkers).forEach((id) => {
    if (!activeDriverIds.has(Number(id))) {
      driverMarkers[id].remove();
      removeDriverMarker(id);
    }
  });
}
