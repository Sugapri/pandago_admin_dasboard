/**
 * ui/analytics.ui.js
 * Logic for rendering Chart.js analytics.
 */

import { fetchAnalyticsFromApi } from "../api/analytics.api.js";

let revenueChart = null;
let serviceChart = null;
let growthChart = null;
let distributionChart = null;

/**
 * Load and render all charts.
 */
export async function initAnalytics() {
  const revLoader = document.getElementById("revenue-loader");
  const srvLoader = document.getElementById("service-loader");

  // Tampilkan loader sebelum fetch
  revLoader?.classList.remove("hidden");
  srvLoader?.classList.remove("hidden");

  try {
    const data = await fetchAnalyticsFromApi();
    console.log("Fetched analytics data:", data);

    if (!data) throw new Error("Data kosong dari server");

    // Render Revenue (Utama)
    if (data.revenue_weekly) renderRevenueChart(data.revenue_weekly);

    // Render Service Popularity
    if (data.service_popularity) renderServiceChart(data.service_popularity);

    // Big Data Charts (New)
    renderGrowthChart(data.growth_metrics || simulationGrowthData());

    // Render Distribution (Bar Chart) menggunakan data popularity yang sama
    if (data.service_popularity)
      renderDistributionChart(data.service_popularity);
  } catch (e) {
    console.error("Analytics Initialization Error:", e);

    // Hapus chart yang ada jika terjadi error saat reload
    if (revenueChart) {
      revenueChart.destroy();
      revenueChart = null;
    }
    if (serviceChart) {
      serviceChart.destroy();
      serviceChart = null;
    }

    // Deteksi jika server lokal mati (Failed to fetch)
    const isConnectionError =
      e.message.includes("Failed to fetch") ||
      e.message.includes("NetworkError");
    const displayMsg = isConnectionError ? "Koneksi Lokal Gagal" : e.message;

    handleChartError("revenueChart", displayMsg);
    handleChartError("serviceChart", "Gagal Koneksi");
  } finally {
    // Sembunyikan loader setelah selesai (berhasil atau gagal)
    revLoader?.classList.add("hidden");
    srvLoader?.classList.add("hidden");
  }
}

/**
 * Helper untuk menampilkan pesan error di dalam canvas
 */
function handleChartError(canvasId, message) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ef4444"; // rose-500
  ctx.font = "bold 12px 'Plus Jakarta Sans'";
  ctx.textAlign = "center";
  ctx.fillText(message, w / 2, h / 2);
}

/**
 * Render the Weekly Revenue line chart.
 */
function renderRevenueChart(revenueData) {
  const canvas = document.getElementById("revenueChart");
  if (!canvas) return;
  console.log("Revenue Chart Canvas:", canvas); // Debug: Pastikan elemen canvas ditemukan

  const ctx = canvas.getContext("2d");

  if (revenueChart) revenueChart.destroy();

  // Normalize incoming data from server to expected shape:
  // [{ day: 'Mon', amount: 12345 }]
  // Backend may return other field names; support common variants.
  const normalized = (Array.isArray(revenueData) ? revenueData : [])
    .map((d, i) => {
      if (d && typeof d === "object") {
        const day =
          d.day ??
          d.label ??
          d.date ??
          d.x ??
          d.day_of_week ??
          d.weekday ??
          null;

        const amount =
          d.amount ??
          d.total ??
          d.value ??
          d.y ??
          d.revenue ??
          (typeof d.commission === "number" ? d.commission : null);

        // If date is provided as ISO string/number, format it.
        let formattedDay = day;
        if (formattedDay != null) {
          // If looks like a date
          if (
            typeof formattedDay === "string" &&
            (formattedDay.includes("-") || formattedDay.includes("T"))
          ) {
            const dt = new Date(formattedDay);
            formattedDay = Number.isNaN(dt.getTime())
              ? formattedDay
              : dt.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "2-digit",
                });
          } else if (typeof formattedDay === "number") {
            const dt = new Date(formattedDay);
            formattedDay = Number.isNaN(dt.getTime())
              ? String(formattedDay)
              : dt.toLocaleDateString("id-ID", {
                  weekday: "short",
                  day: "2-digit",
                });
          }
        }

        return {
          day: formattedDay ?? `Day ${i + 1}`,
          amount: typeof amount === "number" ? amount : Number(amount ?? 0),
        };
      }

      // If backend returns array of numbers
      if (typeof d === "number") {
        return { day: `Day ${i + 1}`, amount: d };
      }

      return { day: `Day ${i + 1}`, amount: 0 };
    })
    .slice(-7); // Ambil 7 data terbaru (tren terakhir) untuk grafik mingguan

  const labels = normalized.map((d) => d.day);
  const amounts = normalized.map((d) => d.amount);
  console.log("Revenue Chart Labels:", labels); // Debug: Lihat label data
  console.log("Revenue Chart Amounts:", amounts); // Debug: Lihat nilai data

  revenueChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue (Rp)",
          data: amounts,
          borderColor: "#10b981", // Emerald 500
          backgroundColor: "rgba(16, 185, 129, 0.1)", // Light glow effect
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#fff",
          pointRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "#1e293b",
          titleFont: { size: 12, weight: "bold" },
          bodyFont: { size: 12 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) =>
              ` Total: Rp ${new Intl.NumberFormat("id-ID").format(context.raw ?? 0)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "rgba(0,0,0,0.03)", drawBorder: false },
          ticks: {
            font: { size: 10, weight: "600", family: "'Plus Jakarta Sans'" },
            color: "#94a3b8",
            callback: (value) =>
              value >= 1000 ? `Rp ${value / 1000}k` : `Rp ${value}`,
          },
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: "bold" } },
        },
      },
    },
  });
}

/**
 * Render the Service Popularity pie chart.
 */
function renderServiceChart(serviceData) {
  const canvas = document.getElementById("serviceChart");
  if (!canvas || !serviceData) return;

  console.log("Service Chart Canvas:", canvas); // Debug: Pastikan elemen canvas ditemukan
  const ctx = canvas.getContext("2d");

  if (serviceChart) serviceChart.destroy();

  const labels = serviceData.map((s) => s.service_type || "Unknown");
  const counts = serviceData.map((s) => s.total || 0);

  serviceChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
          borderWidth: 0,
          hoverOffset: 10,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: "#94a3b8",
            font: { size: 10, weight: "bold" },
            padding: 20,
            usePointStyle: true,
          },
        },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#1e293b",
          bodyColor: "#1e293b",
          padding: 12,
          boxPadding: 6,
          borderColor: "#e2e8f0",
          borderWidth: 1,
        },
      },
    },
  });
}

/**
 * Render the Growth Trajectory chart (Big Data).
 */
function renderGrowthChart(growthData) {
  const canvas = document.getElementById("growthChart");
  if (!canvas || !growthData) return;

  console.log("Growth Chart Canvas:", canvas); // Debug: Pastikan elemen canvas ditemukan
  const ctx = canvas.getContext("2d");

  if (growthChart) growthChart.destroy();

  growthChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: growthData.labels,
      datasets: [
        {
          label: "Current Year",
          data: growthData.current,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          fill: true,
          tension: 0.4,
          borderWidth: 3,
        },
        {
          label: "Previous Year",
          data: growthData.previous,
          borderColor: "#94a3b8",
          borderDash: [5, 5],
          fill: false,
          tension: 0.4,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: { usePointStyle: true, font: { size: 10 } },
        },
      },
      scales: {
        y: {
          grid: { color: "rgba(0,0,0,0.03)" },
          ticks: { font: { size: 9 } },
        },
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      },
    },
  });
}

/**
 * Render the Market Share / Distribution chart (Big Data).
 */
function renderDistributionChart(data) {
  const canvas = document.getElementById("distributionChart");
  if (!canvas || !data) return;

  console.log("Distribution Chart Canvas:", canvas); // Debug: Pastikan elemen canvas ditemukan
  const ctx = canvas.getContext("2d");

  if (distributionChart) distributionChart.destroy();

  distributionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: data.map((s) => s.service_type || "Unknown"),
      datasets: [
        {
          label: "Orders",
          data: data.map((s) => s.total || 0),
          backgroundColor: [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#ef4444",
            "#8b5cf6",
          ],
          borderRadius: 12,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: { grid: { display: false }, ticks: { font: { size: 9 } } },
        x: { grid: { display: false }, ticks: { font: { size: 9 } } },
      },
    },
  });
}

function simulationGrowthData() {
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    current: [30, 45, 42, 60, 75, 90],
    previous: [20, 25, 30, 35, 40, 45],
  };
}

window.toggleBigDataTable = () => {
  const wrapper = document.getElementById("big-data-wrapper");
  const label = document.getElementById("big-data-toggle-label");
  const icon = document.getElementById("big-data-toggle-icon");
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
