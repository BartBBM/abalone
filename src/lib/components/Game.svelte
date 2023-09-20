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

	onDestroy(() => {
		$chosen_player = null;
		$game = new Game();
	});
</script>

<!-- {@debug game} -->

<div class="my-4 flex justify-center gap-36">
	<!-- {#if $chosen_player}
		<div class="flex content-center items-center justify-center gap-2">
			<span class="text-base font-semibold">Your color: </span>
			<div
				class="{$chosen_player == Player.White
					? OwnColors.White
					: OwnColors.Black} h-4 w-4 rounded-full shadow-sm shadow-black"
			/>
		</div>
	{/if} -->
	<div class="flex content-center items-center justify-center gap-1">
		<div
			class="{$game.turn.active_player == Player.White
				? OwnColors.White
				: OwnColors.Black} h-4 w-4 rounded-full shadow-sm shadow-black"
		/>
		<!-- <span>{$game.turn.active_player == Player.White ? 'Fuchsia | White' : 'Teal | Black'}</span>'s -->
		<span class="text-base font-semibold">'s turn</span>
	</div>
</div>
<div class="flex justify-center">
	<div class="relative">
		<div class="">
			<div class="flex max-w-fit flex-col">
				{#each $game.board as row, row_index}
					<div class="flex justify-center">
						{#each row as cell, col_index}
							<Cell_Component position={{ row: row_index, col: col_index }} />
						{/each}
					</div>
				{/each}
			</div>
		</div>
		{#if $chosen_player}
			<div
				class="absolute left-[48%] top-[2%] -z-40 h-full w-1/2 rounded-3xl bg-gradient-to-tr from-transparent from-80% {$chosen_player ==
				Player.White
					? 'to-pink-300'
					: 'to-emerald-400'}"
			/>{/if}
	</div>
</div>

<!-- <div class="mt-8 text-center">Kicked out marbles</div> -->
<div class="flex justify-center pb-2 pt-6">
	<div
		class="min-h-[5rem] min-w-[20rem] max-w-fit rounded-full bg-gradient-to-br from-slate-600 via-slate-500 via-80% to-slate-400 px-4 py-1"
	>
		<div class="flex content-center justify-center">
			{#each $game.outs as cell, index}
				<Cell_Component position={index} />
			{/each}
		</div>
	</div>
</div>

{#if $win_animation.is_visible}
	<WinAnimation />
{/if}
