<script lang="ts">
	import { Cell, CellState } from '$lib/index';
	import { game } from '$lib/stores';
	import { onDestroy } from 'svelte';

	export let cell_state: CellState = CellState.Empty;
	export let row: number;
	export let col: number;

	let is_selected = false;
	// $: {
	// 	is_selected = $game.board[row][col].is_selected;
	// }
	const unsubscribe = game.subscribe((value) => {
		is_selected = value.board[row][col].is_selected;
	});
	onDestroy(unsubscribe);

	function cell_background(cell_state: CellState): String {
		if (cell_state == CellState.White) return 'bg-teal-800';
		if (cell_state == CellState.Black) return 'bg-fuchsia-800';
		return 'bg-white';
	}

	function toggle_selected() {
		is_selected = !is_selected;
		$game.board[row][col].is_selected = is_selected;

		if (is_selected == true) {
			// game.update((game) => game.remove_any_other_selected_cells([row, col]));
			$game.remove_any_other_selected_cells([[row, col]]); // other stuff is not subscribed, maybe use a cell type here as data and subscribe to it
			$game = $game; // so that other subscribers to the store get notified
			// mark_adjacent_cells();
		}
	}
</script>

<button
	on:click={toggle_selected}
	class="mx-1 h-16 w-16 rounded-full border-2 border-black shadow-sm hover:shadow-lg hover:brightness-125 {cell_background(
		cell_state
	)} {is_selected ? 'border-dashed shadow-xl brightness-110' : ''}"
	id="{row}|{col}"
/>
