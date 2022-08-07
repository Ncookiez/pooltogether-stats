<script lang="ts">

	// Imports:
	import { timestampsToDates } from '$lib/functions';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';

	// Type Imports:
	import type { Hash, LineChartInfo, PieChartInfo, PlayerData } from '$lib/types';

	// Initializations:
	export let wallet: Hash;
	export let playerData: PlayerData;

	// Charts:
	const balanceChart: LineChartInfo = { name: `${wallet}BalanceChart`, title: 'Balance Over Time', xAxisValues: [], data: [{ label: 'Balance', data: [] }], dollarValues: true };
	const chainAllocationsChart: PieChartInfo = { name: `${wallet}ChainAllocationsChart`, title: 'Chain Allocation', sectionLabels: [], data: [], dollarValues: true };
	const depositsChart: LineChartInfo = { name: `${wallet}DepositsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposits', data: [] }], dollarValues: true };
	const claimsChart: LineChartInfo = { name: `${wallet}ClaimsChart`, title: 'Cumulative Claims Over Time', xAxisValues: [], data: [{ label: 'Claims', data: [] }], dollarValues: true };
	const withdrawalsChart: LineChartInfo = { name: `${wallet}WithdrawalsChart`, title: 'Cumulative Withdrawals Over Time', xAxisValues: [], data: [{ label: 'Withdrawals', data: [] }], dollarValues: true };

	// Reactive Chart Data:
	$: setChartData(playerData);

	// Function to set chart data:
	const setChartData = (playerData: PlayerData) => {

		// Initializing Chart Timestamps:
		const timestamps = timestampsToDates(playerData.timestamps);

		// Setting Chart X Axis Values / Section Labels:
		balanceChart.xAxisValues = timestamps;
		chainAllocationsChart.sectionLabels = ['Ethereum', 'Polygon', 'Avalanche', 'Optimism'];
		depositsChart.xAxisValues = timestamps;
		claimsChart.xAxisValues = timestamps;
		withdrawalsChart.xAxisValues = timestamps;

		// Setting Chart Data:
		balanceChart.data[0].data = playerData.balancesOverTime;
		chainAllocationsChart.data = [Math.floor(playerData.balances.eth), Math.floor(playerData.balances.poly), Math.floor(playerData.balances.avax), Math.floor(playerData.balances.op)];
		depositsChart.data[0].data = playerData.depositsOverTime;
		claimsChart.data[0].data = playerData.claimsOverTime;
		withdrawalsChart.data[0].data = playerData.withdrawalsOverTime;
	}
	
</script>

<!-- #################################################################################################### -->

<!-- Charts & Highlights -->
<LineChart {...balanceChart} />
<PieChart {...chainAllocationsChart} />
<LineChart {...depositsChart} />
<LineChart {...claimsChart} />
<LineChart {...withdrawalsChart} />

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>