<script lang="ts">

	// Imports:
	import { onMount } from 'svelte';
	import { getChainName, timestampsToDates } from '$lib/functions';
	import { ethData, polyData, avaxData, opData } from '$lib/stores';
	import PieChart from '$lib/PieChart.svelte';
	import LineChart from '$lib/LineChart.svelte';

	// Type Imports:
	import type { Chain, LineChartInfo, PieChartInfo } from '$lib/types';

	// Initializations:
	const chain: Chain = 'op';
	const chainName = getChainName(chain);

	// Charts:
	const tvlChart: LineChartInfo = { name: `${chain}TvlChart`, title: 'TVL Over Time', xAxisValues: [], data: [{ label: 'TVL', data: [] }], dollarValues: true };
	const cumulativeDepositAmountsChart: LineChartInfo = { name: `${chain}CumulativeDepositAmountsChart`, title: 'Cumulative Deposits Over Time', xAxisValues: [], data: [{ label: 'Deposit Amounts', data: [] }], dollarValues: true };

	onMount(() => {
		if($opData.tvlOverTime && $opData.depositsOverTime) {
			tvlChart.xAxisValues = timestampsToDates($opData.tvlOverTime.timestamps);
			tvlChart.data[0].data = $opData.tvlOverTime.tvls;
			cumulativeDepositAmountsChart.xAxisValues = timestampsToDates($opData.depositsOverTime.timestamps);
			cumulativeDepositAmountsChart.data[0].data = $opData.depositsOverTime.cumulativeDepositAmounts;
		}
	});
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>PoolTogether Stats | {chainName}</title>
	<meta name="description" content="An app for querying and analyzing some PoolTogether statistics. Check out some {chainName}-specific stats!" />
</svelte:head>

<!-- TVL Chart -->
<LineChart {...tvlChart} />

<!-- Unique Wallets Highlight -->
<!-- TODO - highlight unique wallet balances from balances > 0 -->

<!-- Cumulative Deposits Chart -->
<LineChart {...cumulativeDepositAmountsChart} />

<!-- Cumulative Withdrawals Chart -->

<!-- Cumulative Claims Chart -->

<!-- Pie Chart -->
<!-- <PieChart {...testPieChart} /> -->

<!-- Latest Xs -->
<!-- TODO - display latest deposits, latest winners, etc. -->

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>