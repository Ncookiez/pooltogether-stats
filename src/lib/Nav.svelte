<script>

	// Initializations:
	const links = [
		{ route: '/', name: 'Home' }
	];

</script>

<!-- #################################################################################################### -->

<nav>

	<!-- Navigation Links -->
	<ul class="links">
		{#each links as link}
			<li><a href="{link.route}">{link.name}</a></li>
		{/each}
	</ul>

</nav>

<!-- #################################################################################################### -->

<style>

	nav {
		display: flex;
		align-items: center;
		height: 60px;
		width: 100%;
		padding: 0 32px;
	}

	ul {
		display: flex;
	}
	
	li {
		margin: 0 2em 0 0;
		list-style: none;
	}

	a {
		color: inherit;
		text-decoration: none;
	}
	
</style>