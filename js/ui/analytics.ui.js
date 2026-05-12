/**
 * ui/analytics.ui.js
 * Logic for rendering Chart.js analytics.
 */

import { fetchAnalyticsFromApi } from "../api/analytics.api.js";

let revenueChart = null;
let serviceChart = null;

/**
 * Load and render all charts.
 */
export async function initAnalytics() {
  try {
    const data = await fetchAnalyticsFromApi();
    renderRevenueChart(data.revenue_weekly);
    renderServiceChart(data.service_popularity);
  } catch (e) {
    console.error("Analytics Initialization Error:", e);
  }
}

/**
 * Render the Weekly Revenue line chart.
 */
function renderRevenueChart(revenueData) {
  const ctx = document.getElementById('revenueChart').getContext('2d');
  
  if (revenueChart) revenueChart.destroy();

  revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: revenueData.map(d => d.day),
      datasets: [{
        label: 'Revenue (Rp)',
        data: revenueData.map(d => d.amount),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: '#10b981',
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#1e293b',
          titleFont: { size: 12, weight: 'bold' },
          bodyFont: { size: 12 },
          padding: 12,
          displayColors: false,
          callbacks: {
            label: (context) => `Rp ${new Intl.NumberFormat('id-ID').format(context.raw)}`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
          ticks: {
            font: { size: 10, weight: 'bold' },
            callback: (value) => `Rp ${value / 1000}k`
          }
        },
        x: {
          grid: { display: false },
          ticks: { font: { size: 10, weight: 'bold' } }
        }
      }
    }
  });
}

/**
 * Render the Service Popularity pie chart.
 */
function renderServiceChart(serviceData) {
  const ctx = document.getElementById('serviceChart').getContext('2d');
  
  if (serviceChart) serviceChart.destroy();

  const labels = serviceData.map(s => s.service_type || 'Unknown');
  const counts = serviceData.map(s => s.total);

  serviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: counts,
        backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#94a3b8',
            font: { size: 10, weight: 'bold' },
            padding: 20,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: '#fff',
          titleColor: '#1e293b',
          bodyColor: '#1e293b',
          padding: 12,
          boxPadding: 6,
          borderColor: '#e2e8f0',
          borderWidth: 1
        }
      }
    }
  });
}
