<script lang="ts">
	import { Cell, CellState } from '$lib/index';
	import { game } from '$lib/stores';

	export let cell_state: CellState = CellState.Empty;
	export let row: number;
	export let col: number;

	let is_selected = false;
	let is_selectable = false;
	$: {
		is_selected = $game.board[row][col].is_selected;
		is_selectable = $game.board[row][col].is_selectable;
		cell_state = $game.board[row][col].state;
	}

	function cell_background(cell_state: CellState): String {
		if (cell_state == CellState.White) return 'bg-teal-800';
		if (cell_state == CellState.Black) return 'bg-fuchsia-800';
		return 'bg-white';
	}

	function toggle_selected() {
		$game.action(row, col);
		$game = $game; // so that other subscribers to the store get notified
	}
</script>

<button
	on:click={toggle_selected}
	class="mx-1 h-16 w-16 rounded-full border-2 border-black shadow-sm hover:shadow-lg hover:brightness-125
	{cell_background(cell_state)} 
	{is_selected ? 'border-dashed shadow-xl brightness-110' : ''} 
	{is_selectable ? 'border-dotted shadow-md brightness-105' : ''}"
	id="{row}|{col}"
/>
