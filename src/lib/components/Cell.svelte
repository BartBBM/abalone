<script lang="ts">
	import type { Cell, Marble } from '$lib/index';
	import { chosen_player, game } from '$lib/stores';
	import { crossfade } from '$lib/utils/crossfade';
	import { show_notification } from '../utils/notification';
	import { show_win } from '../utils/win-notification';
	import { Player } from '../turn_state_machine';
	import type { Position } from '../utils/position';
	import { tick } from 'svelte';
	import { OwnColors } from '$lib/utils/colors';

	export let position: Position;

	let is_selected = false;
	let is_selectable = false;
	let marble: Marble | null = null;
	let next_marble: Marble | null = null;

	let marble_key = -1;
	let next_marble_key = -1;
	$: {
		let tmp: Cell;
		if (typeof position !== 'number') tmp = $game.board[position.row][position.col];
		else tmp = $game.outs[position];

		is_selected = tmp.is_selected;
		is_selectable = tmp.is_selectable;
		marble = tmp.marble;
		next_marble = tmp.next_marble;

		// save them cuz marble can be null and then key_for_animation cannot be read anymore
		if (marble) marble_key = marble.key_for_animation;
		if (next_marble) next_marble_key = next_marble.key_for_animation;
	}

	function cell_background(cell_state: Player): String {
		if (cell_state == Player.White) return OwnColors.White;
		if (cell_state == Player.Black) return OwnColors.Black;
		return '';
	}

	async function toggle_selected() {
		try {
			if ($chosen_player && $chosen_player !== $game.turn.active_player) return;
			if (typeof position === 'number') return;
			console.info(`this.action(${position.row}, ${position.col});`);

			if ($chosen_player) {
				// make post request
				const response = await fetch('', {
					method: 'POST',
					body: JSON.stringify({ position }),
					headers: {
						'Content-Type': 'application/json'
					}
				});
				const json_body = await response.json();
				const json_game_info = json_body.updated_json_game_info;
				$game.update_from_json(JSON.parse(json_game_info));
			} else {
				$game.action(position.row, position.col);
			}
		} catch (error) {
			console.log(error);
			show_notification((error as Error).message);
		}

		$game = $game; // so that other subscribers to the store get notified
	}

	// i do not understand this
	function reorder_board() {
		// with this it works always
		setTimeout(() => {
			$game.reorder_board();
			$game = $game;
		}, 1);

		// this alone it does not, even blinks shortly
		// $game.reorder_board();
		// $game = $game;
	}

	const [send, receive] = crossfade;
</script>

<button
	on:click={toggle_selected}
	class="relative mx-1 box-content h-16 w-16 flex-none rounded-full border-2 border-black shadow-sm shadow-black hover:shadow-lg hover:brightness-125
	{is_selected ? 'border-dashed shadow-2xl brightness-110' : ''} 
	{is_selectable ? 'border-dotted shadow-lg brightness-105' : ''}"
>
	{#if marble}
		<div
			class="absolute bottom-0 left-0 right-0 top-0 h-16 w-16 rounded-full {cell_background(
				marble.state
			)}"
			out:send|global={{ key: marble_key }}
		/>
	{/if}
	{#if next_marble}
		<div
			class="absolute bottom-0 left-0 right-0 top-0 h-16 w-16 rounded-full {cell_background(
				next_marble.state
			)}"
			in:receive|global={{ key: next_marble_key }}
			on:introend={reorder_board}
		/>
	{/if}
</button>
