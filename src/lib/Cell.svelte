<script lang="ts">
	import { CellState, OwnColors } from '$lib/index';
	import { game } from '$lib/stores';
	import { crossfade } from '$lib/crossfade';
	import { show_notification } from './utils/notification';
	import { show_win } from './utils/win-notification';

	export let cell_state: CellState = CellState.Empty;

	// change row, col, index to Position
	export let row: number;
	export let col: number;

	export let index: number | null = null;

	export let key_for_animation: number;

	let is_selected = false;
	let is_selectable = false;
	$: {
		let tmp;
		if (index == null) tmp = $game.board[row][col];
		else tmp = $game.outs[index];

		if (tmp != undefined) {
			is_selected = tmp.is_selected;
			is_selectable = tmp.is_selectable;
			cell_state = tmp.state;
		}
	}

	function cell_background(cell_state: CellState): String {
		if (cell_state == CellState.White) return OwnColors.White;
		if (cell_state == CellState.Black) return OwnColors.Black;
		return 'bg-white';
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

	const [send, receive] = crossfade;
</script>

<button
	on:click={toggle_selected}
	class="mx-1 h-16 w-16 rounded-full border-2 border-black shadow-sm hover:shadow-lg hover:brightness-125
	{cell_background(cell_state)} 
	{is_selected ? 'border-4 border-dashed shadow-xl brightness-110' : ''} 
	{is_selectable ? 'border-4 border-dotted shadow-md brightness-105' : ''}"
	id="{row}|{col}"
	in:receive={{ key: key_for_animation }}
	out:send={{ key: key_for_animation }}
/>
