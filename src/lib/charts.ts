
// Type Imports:
import type { ChartConfiguration } from 'chart.js';

// Chart Settings:
const axisColor = 'white';

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
        ticks: { color: axisColor }
      },
      y: {
        ticks: { color: axisColor }
      }
    }
  }
}