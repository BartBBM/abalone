<!-- I want to save my game data in a svelte store so it is accessible from everywhere.

I want to be able to call a function on a cell which influences its state. 
-> So data (being clicked) is coming from cell_component which updates itself and the global state. Game component is subscribed to global state and then calls on every adjecent cell to update itself. -->

<script lang="ts">
	import { Cell, CellState, Game } from '$lib/index';
	import Cell_Component from '$lib/Cell.svelte';
	import { game } from '$lib/stores';

	// function main() {}
	// main();
</script>

{@debug game}

<div class="flex flex-col">
	{#each $game.board as row, row_index}
		<div class="flex justify-center">
			{#each row as cell, col_index}
				<Cell_Component cell_state={cell.state} row={row_index} col={col_index} />
			{/each}
		</div>
	{/each}
</div>
