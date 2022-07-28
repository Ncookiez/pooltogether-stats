
// Type Imports:
import type { Line } from '$lib/types';
import type { Chart, ChartConfiguration } from 'chart.js';

// Chart Settings:
const baseColor = 'white';
const appBackgroundColor = '#4c249f';

// Line Chart Default Settings:
const defaultLineColor = '#FFB636';
const defaultBackgroundColor = defaultLineColor + '80';
const defaultLineWidth = 2;
const defaultPointRadius = 0;
const defaultPointHoverRadius = 5;
const defaultLineTension = 0.2;

// Pie Chart Default Settings:
const defaultSectionBorderWidth = 10;

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

/* ====================================================================================================================================================== */

// Function to set line chart data:
export const setLineChartData = (chart: Chart, xAxisValues: string[], lines: Line[], dollarValues?: boolean) => {
  chart.data.labels = xAxisValues;
  lines.forEach(line => {
    chart.data.datasets.push({
      label: line.label,
      data: line.data,
      backgroundColor: line.backgroundColor ?? defaultBackgroundColor,
      borderColor: line.lineColor ?? defaultLineColor,
      borderWidth: line.lineWidth ?? defaultLineWidth,
      pointRadius: line.pointRadius ?? defaultPointRadius,
      pointHoverRadius: line.pointHoverRadius ?? defaultPointHoverRadius,
      tension: line.tension ?? defaultLineTension
    });
  });
  if(dollarValues && chart.options.plugins?.tooltip && chart.options.scales?.y && chart.options.scales.y.ticks) {
    chart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
    chart.options.scales.y.ticks.callback = (value) => { return '$' + value.toLocaleString(undefined) };
  }
}

// Function to set pie chart data:
export const setPieChartData = (chart: Chart, sectionLabels: string[], data: number[], hiddenPercentage: number, appendedLabel?: string) => {
  chart.data.labels = sectionLabels;
  chart.data.datasets[0].data = data;
  chart.data.datasets[0].backgroundColor = getPieChartColors(data.length);
  chart.data.datasets[0].borderColor = [appBackgroundColor];
  chart.data.datasets[0].borderWidth = defaultSectionBorderWidth;
  if(chart.options.plugins?.tooltip && chart.options.plugins?.datalabels) {
    chart.options.plugins.tooltip.callbacks = { label: (item) => { return `  ${item.label}: ${item.formattedValue}${appendedLabel ? ` ${appendedLabel}` : ''}` }};
    chart.options.plugins.datalabels.formatter = (value: string, context: any) => {
      let numValue = parseInt(value);
      let totalValue = 0;
      context.dataset.data.forEach((data: string) => {
        totalValue += parseInt(data);
      });
      let percentage = (numValue / totalValue) * 100;
      if(percentage < hiddenPercentage) {
        return '';
      } else {
        return `${context.chart.data.labels[context.dataIndex]}\n${percentage.toFixed(1)}%`;
      }
    }
  }
}

/* ====================================================================================================================================================== */

// Helper function to get pie chart section colors:
const getPieChartColors = (numColors: number) => {
  if(numColors === 1) {
    return ['#9f82d7'];
  } else if(numColors === 2) {
    return ['#9f82d7', '#341762'];
  } else if(numColors === 3) {
    return ['#9F82D7', '#6A4D9D', '#341762'];
  } else if(numColors === 4) {
    return ['#9F82D7', '#7B5EB0', '#583B89', '#341762'];
  } else if(numColors === 5) {
    return ['#9F82D7', '#8467BA', '#6A4D9D', '#4F327F', '#341762'];
  } else if(numColors === 6) {
    return ['#9F82D7', '#8A6DC0', '#7457A8', '#5F4291', '#492C79', '#341762'];
  } else if(numColors === 7) {
    return ['#9F82D7', '#8D70C4', '#7B5EB0', '#6A4D9D', '#583B89', '#462976', '#341762'];
  } else if(numColors === 8) {
    return ['#9F82D7', '#9073C6', '#8063B6', '#7154A5', '#624594', '#533683', '#432673', '#341762'];
  } else if(numColors === 9) {
    return ['#9F82D7', '#9275C8', '#8467BA', '#775AAB', '#6A4D9D', '#5C3F8E', '#4F327F', '#412471', '#341762'];
  } else {
    return ['#9F82D7', '#9376CA', '#876ABD', '#7B5EB0', '#6F52A3', '#644796', '#583B89', '#4C2F7C', '#40236F', '#341762'];
  }
}