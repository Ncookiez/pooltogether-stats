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
	export let title: string = '';
	export let xAxisValues: string[];
	export let data: Line[];
	export let dollarValues: boolean = false;
	export let stacked: boolean = false;
	export let hide: boolean = false;
	const dayInSeconds = 86400;
	const maxTicks = 15;
	let lineChart: Chart;

	// Line Chart Settings:
	const baseColor = 'white';
	const defaultLineColor = '#FFB636';
	const defaultLineWidth = 2;
	const defaultPointRadius = 0;
	const defaultPointHoverRadius = 5;
	const defaultLineTension = 0.2;

	// Reactive Chart Updates:
	$: onUpdate(xAxisValues, data, dollarValues, stacked);

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
	const setLineChartData = (chart: Chart, xAxisValues: string[], lines: Line[], dollarValues?: boolean, stacked?: boolean) => {
		chart.data.labels = xAxisValues;
		chart.data.datasets = [];
		lines.forEach(line => {
			chart.data.datasets.push({
				label: line.label,
				data: line.data.slice(),
				borderColor: line.lineColor ?? defaultLineColor,
				backgroundColor: line.backgroundColor ?? (line.lineColor ?? defaultLineColor) + '80',
				borderWidth: line.lineWidth ?? defaultLineWidth,
				pointRadius: line.pointRadius ?? defaultPointRadius,
				pointHoverRadius: line.pointHoverRadius ?? defaultPointHoverRadius,
				tension: line.tension ?? defaultLineTension,
				fill: stacked ? true : false
			});
		});
		if(chart.options.plugins?.tooltip && chart.options.scales?.y && chart.options.scales.y.ticks && chart.options.scales.x && chart.options.scales.x.ticks) {
			chart.options.plugins.tooltip.itemSort = (a, b) => { return (b.raw as number) - (a.raw as number) };
			chart.options.scales.x.ticks.maxTicksLimit = Math.min(Math.ceil(((Date.parse(xAxisValues[xAxisValues.length - 1]) / 1000) - (Date.parse(xAxisValues[0]) / 1000)) / dayInSeconds) + 1, maxTicks);
			if(dollarValues) {
				chart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: $${(item.raw as number).toLocaleString(undefined)}` } };
				chart.options.scales.y.ticks.callback = (value) => { return (value < 0 ? '-$' : '$') + Math.abs(parseInt(value as string)).toLocaleString(undefined) };
			}
			if(stacked) {
				chart.options.scales.y.min = 0;
				chart.options.scales.y.max = 100;
				chart.options.scales.y.ticks.callback = (value) => { return value + '%' };
				// @ts-ignore
				chart.options.scales.y.stacked = true;
				chart.options.plugins.tooltip.callbacks = { label: (item) => { return `${item.dataset.label}: ${(item.raw as number).toFixed(2)}%` } };
				let totalValues: number[] = [];
				chart.data.datasets.forEach(dataset => {
					(dataset.data as number[]).forEach((value, i) => {
						if(totalValues[i]) {
							totalValues[i] += value;
						} else {
							totalValues.push(value);
						}
					});
				});
				chart.data.datasets.forEach(dataset => {
					(dataset.data as number[]).forEach((value, i) => {
						dataset.data[i] = (value / totalValues[i]) * 100;
					});
				});
			}
		}
	}

	// Function to update chart data:
	const onUpdate = (xAxisValues: string[], data: Line[], dollarValues: boolean, stacked: boolean) => {
		if(lineChart) {
			setLineChartData(lineChart, xAxisValues, data, dollarValues, stacked); 
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
<div class="lineChart" class:hide>
	{#if title !== ''}
		<h3>{title}</h3>
	{/if}
	<canvas id="{name}" />
</div>

<!-- #################################################################################################### -->

<style>

	div.lineChart {
		display: flex;
		flex-direction: column;
		width: 40em;
		padding: 1em;
		background: var(--dark-purple);
		border: 2px solid var(--accent-color);
		border-radius: 1em;
		overflow: hidden;
	}

	h3 {
		margin: 0 0 1em .5em;
		text-shadow: 2px 2px 10px black;
	}
	
</style>