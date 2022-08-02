<script lang="ts">

	// Initializations:
	export let hide: boolean = false;
	
</script>

<!-- #################################################################################################### -->

<!-- Highlight -->
<div class="highlight" class:hide>
	<slot />
</div>

<!-- #################################################################################################### -->

<style>

	div.highlight {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: .3em;
		height: 23.8em;
		width: 40em;
		padding: 1em;
		background: var(--dark-purple);
		border: 2px solid var(--accent-color);
		border-radius: 1em;
		overflow: hidden;
	}
	
</style>