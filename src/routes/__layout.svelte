<script>

	// Imports:
	import Navbar from '$lib/Navbar.svelte';
	import Footer from '$lib/Footer.svelte';
	import '../app.css';
	
</script>

<!-- #################################################################################################### -->

<!-- Navbar -->
<Navbar />

<!-- App Content -->
<main><slot /></main>

<!-- Footer -->
<Footer />

<!-- #################################################################################################### -->

<style>

	main {
		display: flex;
		flex-direction: column;
		align-items: center;
		overflow: hidden auto;
	}

</style>