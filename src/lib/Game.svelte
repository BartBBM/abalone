<script lang="ts">
	import { Cell, CellState, Game, OwnColors } from '$lib/index';
	import Cell_Component from '$lib/Cell.svelte';
	import { game } from '$lib/stores';
	import { Player } from './turn_state_machine';
</script>

<!-- {@debug game} -->

<div class="my-4 text-center">
	Active Player: <div
		class="{$game.turn.active_player == Player.White
			? OwnColors.White
			: OwnColors.Black} inline-block h-4 w-4"
	/>
	<span class="">{$game.turn.active_player == Player.White ? 'Fuchsia' : 'Teal'} </span>
</div>

<div class="flex flex-col">
	{#each $game.board as row, row_index}
		<div class="flex justify-center">
			{#each row as cell, col_index}
				<Cell_Component cell_state={cell.state} row={row_index} col={col_index} />
			{/each}
		</div>
	{/each}
</div>

<div class="mt-8 text-center">Cells which have been kicked out:</div>
<div class=" flex justify-center">
	{#each $game.outs as cell, index}
		<!-- indexes on these Cells do not make sense - todo -->
		<Cell_Component cell_state={cell.state} row={index} col={index} />
	{/each}
</div>
