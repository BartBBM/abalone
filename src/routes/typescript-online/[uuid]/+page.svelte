<script lang="ts">
	import OnlineGame from '$lib/online/OnlineGame.svelte';
	import { game } from '$lib/stores.js';
	import { onMount } from 'svelte';

	export let data;

	onMount(() => {
		// console.log(data);
		$game.update_from_json(data);
		$game = $game;
	});
</script>

<h1 class="my-8 text-center font-bold">Choose Player not yet implemented</h1>
<OnlineGame />
