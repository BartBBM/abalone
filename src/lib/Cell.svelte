<script lang="ts">
	import { Cell, CellState, OwnColors } from '$lib/index';
	import { game } from '$lib/stores';
	import { fade, fly } from 'svelte/transition';
	import { Player } from './turn_state_machine';
	import { notification } from '$lib/stores';

	export let cell_state: CellState = CellState.Empty;
	export let row: number;
	export let col: number;

	export let index: number | null = null;

	let is_selected = false;
	let is_selectable = false;
	$: {
		let tmp;
		if (index == null) tmp = $game.board[row][col];
		else tmp = $game.outs[index];

		is_selected = tmp.is_selected;
		is_selectable = tmp.is_selectable;
		cell_state = tmp.state;
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

	function show_notification(message: string) {
		$notification.message = message; // this updates automatically
		$notification.is_visible = true;

		// Automatically hide the notification after a certain time (e.g., 3 seconds)
		setTimeout(() => {
			$notification.is_visible = false;
		}, 3000);
	}

	function show_win(player: Player) {
		win_animation.player = player;
		win_animation.is_visible = true;
	}

	let win_animation = {
		is_visible: false,
		player: ''
	};
</script>

<button
	on:click={toggle_selected}
	class="mx-1 h-16 w-16 rounded-full border-2 border-black shadow-sm hover:shadow-lg hover:brightness-125
	{cell_background(cell_state)} 
	{is_selected ? 'border-4 border-dashed shadow-xl brightness-110' : ''} 
	{is_selectable ? 'border-4 border-dotted shadow-md brightness-105' : ''}"
	id="{row}|{col}"
/>

<!-- todo make pretty but should be fine -->
{#if win_animation.is_visible}
	<div
		transition:fade
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50"
	>
		<p>{win_animation.player == Player.White ? 'White has won!!!' : 'Black has won!!!'}</p>
	</div>
{/if}
