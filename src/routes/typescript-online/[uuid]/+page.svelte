<script lang="ts">
	import { page } from '$app/stores';
	import Game from '$lib/components/Game.svelte';
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
</script>

{#if $chosen_player}
	<Game />
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
