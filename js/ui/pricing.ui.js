/**
 * ui/pricing.ui.js
 * Logic for the pricing form.
 */

import { fetchPricingFromApi, updatePricingApi } from "../api/pricing.api.js";

export async function loadPricingData() {
  try {
    const p = await fetchPricingFromApi();
    if (p) {
      const fields = [
        "motor_base_fare",
        "motor_price_per_km",
        "motor_min_fare",
        "car_base_fare",
        "car_price_per_km",
        "car_min_fare",
        "service_base_fare",
        "service_price_per_km",
        "service_min_fare",
        "peak_season_increase",
        "holiday_discount",
        "app_fee_percentage",
        "tax_percentage",
      ];

      fields.forEach((field) => {
        const el = document.getElementById(field);
        if (el && p[field] !== undefined) {
          el.value = p[field];
        }
      });
    }
  } catch (e) {
    console.error("Pricing Load Error:", e);
  }
}

window.savePricing = async () => {
  const fields = [
    "motor_base_fare",
    "motor_price_per_km",
    "motor_min_fare",
    "car_base_fare",
    "car_price_per_km",
    "car_min_fare",
    "service_base_fare",
    "service_price_per_km",
    "service_min_fare",
    "peak_season_increase",
    "holiday_discount",
    "app_fee_percentage",
    "tax_percentage",
  ];

  const payload = {};
  fields.forEach((field) => {
    payload[field] = document.getElementById(field)?.value;
  });

  try {
    const result = await updatePricingApi(payload);
    window.showToast?.(
      result.message || "Tarif berhasil diperbarui.",
      "success",
    );
  } catch (e) {
    window.showToast?.(e.message, "error");
  }
};
