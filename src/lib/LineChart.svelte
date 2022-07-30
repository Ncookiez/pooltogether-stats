<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Type Imports:
	import type { Line } from '$lib/types';
	import type { ChartConfiguration } from 'chart.js';

	// Initializations:
	export let name: string;
	export let xAxisValues: string[];
	export let data: Line[];
	export let dollarValues: boolean = false;
	let lineChart: Chart;

	// Line Chart Settings:
	const baseColor = 'white';
	const defaultLineColor = '#FFB636';
	const defaultBackgroundColor = defaultLineColor + '80';
	const defaultLineWidth = 2;
	const defaultPointRadius = 0;
	const defaultPointHoverRadius = 5;
	const defaultLineTension = 0.2;

	// Reactive Chart Updates:
	$: onUpdate(xAxisValues, data, dollarValues);

	// Basic Line Chart Config:
	const lineChartConfig: ChartConfiguration = {
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

	// Function to set line chart data:
	const setLineChartData = (chart: Chart, xAxisValues: string[], lines: Line[], dollarValues?: boolean) => {
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

	// Function to update chart data:
	const onUpdate = (xAxisValues: string[], data: Line[], dollarValues: boolean) => {
		if(lineChart) {
			setLineChartData(lineChart, xAxisValues, data, dollarValues); 
			lineChart.update();
		}
	}

	onMount(() => {
		Chart.register(...registerables, ChartDataLabels);
		lineChart = new Chart(name, structuredClone(lineChartConfig));
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Line Chart -->
<canvas id="{name}" />

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>