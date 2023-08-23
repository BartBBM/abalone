<script lang="ts">
	import { Cell, Game, OwnColors } from '$lib/index';
	import Cell_Component from '$lib/Cell.svelte';
	import { game, win_animation } from '$lib/stores';
	import WinAnimation from './WinAnimation.svelte';
	import { Player } from './turn_state_machine';
	import { fade } from 'svelte/transition';
</script>

<!-- {@debug game} -->

<div class="my-4 text-center">
	Active Player: <div
		class="{$game.turn.active_player == Player.White
			? OwnColors.White
			: OwnColors.Black} inline-block h-4 w-4"
	/>
	<span>{$game.turn.active_player == Player.White ? 'Fuchsia | White' : 'Teal | Black'} </span>
</div>

<div class="flex flex-col">
	{#each $game.board as row, row_index}
		<div class="flex justify-center">
			{#each row as cell, col_index}
				<Cell_Component row={row_index} col={col_index} />
			{/each}
		</div>
	{/each}
</div>

<div class="mt-8 text-center">Cells which have been kicked out:</div>
<div class=" flex justify-center">
	{#each $game.outs as cell, index}
		<!-- indexes on these Cells do not make sense - todo -->
		<Cell_Component {index} row={-1} col={-1} />
	{/each}
</div>

<!-- todo make pretty but should be fine -->
{#if $win_animation.is_visible}
	<WinAnimation />
{/if}
