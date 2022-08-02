<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { Chart, registerables } from 'chart.js';
	import ChartDataLabels from 'chartjs-plugin-datalabels';

	// Type Imports:
	import type { ChartConfiguration } from 'chart.js';

	// Initializations:
	export let name: string;
	export let title: string = '';
	export let sectionLabels: string[];
	export let data: number[];
	export let hiddenPercentage: number = 5;
	export let dollarValues: boolean = false;
	export let appendedLabel: string | undefined = undefined;
	export let hide: boolean = false;
	let pieChart: Chart;

	// Pie Chart Settings:
	const baseColor = 'white';
	const borderColor = '#341762';
	const defaultSectionBorderWidth = 10;

	// Reactive Chart Updates:
	$: onUpdate(sectionLabels, data, hiddenPercentage, appendedLabel);

	// Basic Pie Chart Config:
	const pieChartConfig: ChartConfiguration = {
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

	// Function to set pie chart data:
	const setPieChartData = (chart: Chart, sectionLabels: string[], data: number[], hiddenPercentage: number, appendedLabel?: string) => {
		chart.data.labels = sectionLabels;
		chart.data.datasets[0].data = data;
		chart.data.datasets[0].backgroundColor = getPieChartColors(data.length);
		chart.data.datasets[0].borderColor = [borderColor];
		chart.data.datasets[0].borderWidth = defaultSectionBorderWidth;
		if(chart.options.plugins?.tooltip && chart.options.plugins?.datalabels) {
			chart.options.plugins.tooltip.callbacks = { label: (item) => { return `  ${item.label}: ${dollarValues ? '$' : ''}${item.parsed.toLocaleString(undefined, { maximumFractionDigits: 0 })}${appendedLabel ? ` ${appendedLabel}` : ''}` }};
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

	// Helper function to get pie chart section colors:
	const getPieChartColors = (numColors: number) => {
		if(numColors === 1) {
			return ['#9f82d7'];
		} else if(numColors === 2) {
			return ['#9f82d7', '#4c249f'];
		} else if(numColors === 3) {
			return ['#9F82D7', '#7653BB', '#4c249f'];
		} else if(numColors === 4) {
			return ['#9F82D7', '#8363C4', '#6843B2', '#4c249f'];
		} else if(numColors === 5) {
			return ['#9F82D7', '#8A6BC9', '#7653BB', '#613CAD', '#4c249f'];
		} else if(numColors === 6) {
			return ['#9F82D7', '#8E6FCC', '#7E5CC1', '#6D4AB5', '#5D37AA', '#4c249f'];
		} else if(numColors === 7) {
			return ['#9F82D7', '#9172CE', '#8363C4', '#7653BB', '#6843B2', '#5A34A8', '#4c249f'];
		} else if(numColors === 8) {
			return ['#9F82D7', '#9375CF', '#8767C7', '#7B5ABF', '#704CB7', '#643FAF', '#5831A7', '#4c249f'];
		} else if(numColors === 9) {
			return ['#9F82D7', '#9576D0', '#8A6BC9', '#805FC2', '#7653BB', '#6B47B4', '#613CAD', '#5630A6', '#4c249f'];
		} else {
			return ['#9F82D7', '#9678D1', '#8D6DCB', '#8363C4', '#7A58BE', '#714EB8', '#6843B2', '#5E39AB', '#552EA5', '#4c249f'];
		}
	}

	// Function to update chart data:
	const onUpdate = (sectionLabels: string[], data: number[], hiddenPercentage: number, appendedLabel: string | undefined) => {
		if(pieChart) {
			setPieChartData(pieChart, sectionLabels, data, hiddenPercentage, appendedLabel);
			pieChart.update();
		}
	}

	onMount(() => {
		Chart.register(...registerables, ChartDataLabels);
		pieChart = new Chart(name, structuredClone(pieChartConfig));
	});
	
</script>

<!-- #################################################################################################### -->

<!-- Pie Chart -->
<div class="pieChart" class:hide>
	{#if title !== ''}
		<h3>{title}</h3>
	{/if}
	<canvas id="{name}" />
</div>

<!-- #################################################################################################### -->

<style>

	div.pieChart {
		display: flex;
		flex-direction: column;
		align-items: center;
		height: 23.8em;
		width: 40em;
		padding: 1em;
		background: var(--dark-purple);
		border: 2px solid var(--accent-color);
		border-radius: 1em;
		overflow: hidden;
	}

	h3 {
		width: 100%;
		margin: 0 0 .5em .5em;
		text-shadow: 2px 2px 10px black;
	}

	canvas {
		max-height: 90%;
		max-width: 90%;
	}
	
</style>