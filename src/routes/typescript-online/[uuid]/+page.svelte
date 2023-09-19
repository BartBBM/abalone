<script lang="ts">
	import { page } from '$app/stores';
	import OnlineGame from '$lib/components/online/OnlineGame.svelte';
	import { chosen_player, game } from '$lib/stores.js';
	import { Player } from '$lib/turn_state_machine.js';
	import { OwnColors } from '$lib/utils/colors.js';
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

	$chosen_player = null; // if set before, reset
</script>

<!-- <h1 class="my-8 text-center font-bold">Choose Player not yet implemented</h1> -->

{#if $chosen_player}
	<OnlineGame />
{:else}
	<section class="flex justify-center gap-8">
		<button
			class="h-96 w-64 rounded-lg text-2xl font-bold shadow-xl {OwnColors.White}"
			on:click={() => {
				$chosen_player = Player.White;
			}}>White</button
		>
		<button
			class="h-96 w-64 rounded-lg text-2xl font-bold shadow-xl {OwnColors.Black}"
			on:click={() => {
				$chosen_player = Player.Black;
			}}>Black</button
		>
	</section>
{/if}
