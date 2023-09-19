<script lang="ts">
	import { Cell, Game } from '$lib/index';
	import Cell_Component from '$lib/components/Cell.svelte';
	import { chosen_player, game, win_animation } from '$lib/stores';
	import WinAnimation from '$lib/components/WinAnimation.svelte';
	import { Player, other_player } from '../turn_state_machine';
	import { fade } from 'svelte/transition';
	import { show_win } from '$lib/utils/win-notification';
	import { OwnColors } from '$lib/utils/colors';
	import { onDestroy } from 'svelte';

	$: {
		if ($game.turn.other_player_has_won === true) {
			show_win(other_player($game.turn.active_player));
			$game.turn.other_player_has_won = false;
		}
	}

	onDestroy(() => ($chosen_player = null));
</script>

<!-- {@debug game} -->

<div class="my-4 flex justify-center gap-10">
	{#if $chosen_player}
		<div class="">
			Your color: <div
				class="{$chosen_player == Player.White
					? OwnColors.White
					: OwnColors.Black} inline-block h-4 w-4"
			/>
			<span>{$chosen_player == Player.White ? 'Fuchsia | White' : 'Teal | Black'}</span>
		</div>
	{/if}
	<div class="">
		<div
			class="{$game.turn.active_player == Player.White
				? OwnColors.White
				: OwnColors.Black} inline-block h-4 w-4"
		/>
		<span>{$game.turn.active_player == Player.White ? 'Fuchsia | White' : 'Teal | Black'}</span>'s
		turn
	</div>
</div>

<div class="flex flex-col">
	{#each $game.board as row, row_index}
		<div class="flex justify-center">
			{#each row as cell, col_index}
				<Cell_Component position={{ row: row_index, col: col_index }} />
			{/each}
		</div>
	{/each}
</div>

<div class="mt-8 text-center">Kicked out marbles</div>
<div class="flex justify-center">
	{#each $game.outs as cell, index}
		<Cell_Component position={index} />
	{/each}
</div>

{#if $win_animation.is_visible}
	<WinAnimation />
{/if}
