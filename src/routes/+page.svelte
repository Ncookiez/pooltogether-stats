<script lang="ts">

	// Imports:
	import DashboardCharts from '$lib/DashboardCharts.svelte';
	import DashboardHistory from '$lib/DashboardHistory.svelte';
	
</script>

<!-- #################################################################################################### -->

<!-- SvelteKit Dynamic Header -->
<svelte:head>
	<title>Pool Stats</title>
	<meta name="description" content="An app for all there is to see about PoolTogether statistics." />
</svelte:head>

<!-- Charts & Highlights -->
<DashboardCharts />

<!-- Event History -->
<DashboardHistory />

<!-- #################################################################################################### -->

<style>

	/* CSS Goes Here */
	
</style>