<script lang="ts">
	import { Cell, CellState, Game } from '$lib/index';
	import Cell_Component from '$lib/Cell.svelte';
	import { game } from '$lib/stores';
</script>

<!-- {@debug game} -->

<div class="flex flex-col">
	{#each $game.board as row, row_index}
		<div class="flex justify-center">
			{#each row as cell, col_index}
				<Cell_Component cell_state={cell.state} row={row_index} col={col_index} />
			{/each}
		</div>
	{/each}
</div>
