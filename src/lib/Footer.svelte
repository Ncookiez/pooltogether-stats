<script lang="ts">

	// Initializations:
	const githubLink = `https://github.com`;
	const repoLink = `${githubLink}/Ncookiez/pooltogether-stats`;
	
</script>

<!-- #################################################################################################### -->

<footer>

	<!-- Footer Content -->
	<span>Made with </span>
	<i id="heart" />
	<span> by <a href="{githubLink}/Ncookiez">Ncookie</a> and <a href="{githubLink}/underethsea">Underthesea</a></span>

	<!-- Vibing GIF -->
	<img id="vibing" src="/images/vibing.gif" alt="We Do Be Vibin'">

	<!-- Repository Link -->
	<a id="repoLink" href="{repoLink}" target="__blank" rel="noreferrer"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg></a>

</footer>

<!-- #################################################################################################### -->

<style>

	footer {
		position: fixed;
		bottom: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 48px;
		width: 100%;
		color: rgba(255, 255, 255, 0.65);
		background: var(--dark-purple);
		font-size: 60%;
		font-weight: 800;
		letter-spacing: 0.5px;
		text-transform: uppercase;
		box-shadow: 0 0 20px 2px black;
		overflow: hidden;
		z-index: 1;
	}
	
	a {
		color: inherit;
		transition: color;
	}
	
	a:hover {
		color: rgba(255, 255, 255, 1);
	}
	
	#heart {
		width: 40px;
		height: 40px;
		margin: 0 -8px;
		background: transparent url('/images/heart.png') no-repeat;
		background-size: 2900%;
	}
	
	#heart:hover {
		background-position: right;
		animation: moveHeart 800ms steps(28) forwards;
	}

	#vibing {
		position: absolute;
		bottom: 0;
		left: 0;
		height: 57px;
	}

	#repoLink {
		position: absolute;
		right: 1em;
		height: 30px;
		width: 30px;
		fill: rgba(255, 255, 255, 0.65);
	}

	#repoLink:hover {
		fill: rgba(255, 255, 255, 1);
	}
	
	@keyframes moveHeart {
		0% { background-position: left; }
		50% { background-position: right; }
		100% { background-position: right; }
	}

	@media screen and (max-width: 370px) {
		#vibing, #repoLink {
			display: none;
		}
	}

	@media screen and (max-width: 265px) {
		footer {
			display: none;
		}
	}
	
</style>