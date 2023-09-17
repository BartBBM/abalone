<script lang="ts">
	import { page } from '$app/stores';
	import OnlineGame from '$lib/online/OnlineGame.svelte';
	import { game } from '$lib/stores.js';
	import { onMount } from 'svelte';

	export let data;

	let eventSource: any;

	onMount(() => {
		// console.log(data);
		$game.update_from_json(data);
		$game = $game;

		eventSource = new EventSource(`${$page.url.pathname}/update`);

		eventSource.onmessage = (event: any) => {
			let json_update = event.data;
			console.log('from sse', json_update);
			$game.update_from_json(JSON.parse(json_update));
			$game = $game;
		};

		return () => {
			eventSource.close();
		};
	});
</script>

<h1 class="my-8 text-center font-bold">Choose Player not yet implemented</h1>
<OnlineGame />
