<script lang="ts">

	// Initializations:
	const poolExplorerLink = `https://poolexplorer.win`;
	const duneLink = `https://dune.com/pooltogether`;
	const githubLink = `https://github.com`;
	const repoLink = `${githubLink}/Ncookiez/pooltogether-stats`;
	const functionsRepoLink = `${githubLink}/Ncookiez/pooltogether-stats-functions`;
	
</script>

<!-- #################################################################################################### -->

<!-- ShutDown Mode Message -->
<div id="shutDownMode">
	<h2>Pool Stats is retiring.</h2>
	<div class="whatHappened">
		<p>I know this is not the news many of you wanted to hear, but it's what has to be done. The app has been offline for little while now, and attempts to revive it have been unsuccessful.</p>
		<p>In short, there is so much activity around PoolTogether that the current infrastructure simply cannot handle it, requiring a complete overhaul. Feel free to DM me if you're interested in the more technical details.</p>
		<p>I've loved working on this app for a long time, and I hope it's contributed to high-level overviews or decision-making in the PoolTogether community during its time. Onto other things! :)</p>
	</div>
	<div class="otherResources">
		<p>In its absence, there are many other wonderful builders in the community who have built awesome dashboards for the protocol. Most notably, <a href="{poolExplorerLink}">Pool Explorer</a> by Underthesea, but also many <a href="{duneLink}">Dune</a> dashboards created by Bronder, Sarfang, Gandalfsdad and others.</p>
	</div>
	<div class="furtherDevelopment">
		<p>As with everything I make, the <a href="{repoLink}">source code for this app</a> is open source, along with all the <a href="{functionsRepoLink}">cloud functions</a> that handled data until now. If you wish to pick up any of the functionality of this app into your own projects, you are more than welcome to, and I am available through Discord to help.</p>
	</div>
	<span class="signature">- Ncookie</span>
</div>

<!-- #################################################################################################### -->

<style>

	#shutDownMode {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2em;
		margin-top: 5em;
		text-align: center;
	}

	#shutDownMode > div {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1em;
		max-width: min(50em, 100%);
	}

	a {
		color: var(--secondary-color);
	}

	div.otherResources {
		padding: 1em;
		background-color: var(--dark-purple);
		border-radius: 1em;
	}

	span.signature {
		width: min(50em, 100%);
		padding: 0 1em;
		text-align: right;
	}
	
</style>