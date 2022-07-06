
// Type Imports:
import type { ChartConfiguration } from 'chart.js';

// Chart Settings:
const baseColor = 'white';

/* ====================================================================================================================================================== */

// Basic Line Chart Config:
export const lineChartConfig: ChartConfiguration = {
  type: 'line',
  data: { labels: [], datasets: [] },
  options: {
    responsive: true,
    plugins: {
      datalabels: { opacity: 0 },
      legend: { display: false }
    },
    interaction: { intersect: false, mode: 'index' },
    scales: {
      x: {
        ticks: { color: baseColor }
      },
      y: {
        ticks: { color: baseColor }
      }
    }
  }
}

// Basic Pie Chart Config:
export const pieChartConfig: ChartConfiguration = {
  type: 'pie',
  data: { labels: [], datasets: [{ data: [] }] },
  options: {
    responsive: true,
    plugins: {
      datalabels: {
        color: baseColor,
        textAlign: 'center'
      },
      legend: { display: false }
    }
  }
}