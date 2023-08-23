<script lang="ts">
	import { Cell, Marble, OwnColors } from '$lib/index';
	import { game } from '$lib/stores';
	import { crossfade } from '$lib/crossfade';
	import { show_notification } from './utils/notification';
	import { show_win } from './utils/win-notification';
	import { Player } from './turn_state_machine';

	// change row, col, index to Position
	export let row: number;
	export let col: number;

	export let index: number | null = null;

	let is_selected = false;
	let is_selectable = false;
	let marble: Marble | null = null;
	let next_marble: Marble | null = null;

	let marble_key = -1;
	let next_marble_key = -1;
	$: {
		let tmp: Cell;
		if (index == null) tmp = $game.board[row][col];
		else tmp = $game.outs[index];

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

	function toggle_selected() {
		try {
			console.info(`this.action(${row}, ${col});`);
			let player = $game.action(row, col);
			if (player != undefined) show_win(player);
		} catch (error) {
			console.log(error);
			show_notification((error as Error).message);
		}

		$game = $game; // so that other subscribers to the store get notified
	}

	function reorder_board() {
		$game.reorder_board();
		$game = $game;
	}

	const [send, receive] = crossfade;
</script>

<button
	on:click={toggle_selected}
	class="relative mx-1 box-content h-16 w-16 rounded-full border-2 border-black shadow-sm shadow-black hover:shadow-lg hover:brightness-125
	{is_selected ? 'border-dashed shadow-2xl brightness-110' : ''} 
	{is_selectable ? 'border-dotted shadow-lg brightness-105' : ''}"
	id="{row}|{col}"
>
	{#if marble}
		<div
			class="absolute bottom-0 left-0 right-0 top-0 z-20 h-16 w-16 rounded-full {cell_background(
				marble.state
			)}"
			out:send|global={{ key: marble_key }}
		/>
		<!-- on:outroend={() => console.log('marble send', row, col, marble_key)} -->
	{/if}
	{#if next_marble}
		<div
			class="absolute bottom-0 left-0 right-0 top-0 z-10 h-16 w-16 rounded-full {cell_background(
				next_marble.state
			)}"
			in:receive|global={{ key: next_marble_key }}
			on:introend={reorder_board}
		/>
	{/if}
</button>
