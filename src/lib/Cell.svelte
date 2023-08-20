<script lang="ts">
	import { Cell, CellState, OwnColors } from '$lib/index';
	import { game } from '$lib/stores';
	import { fly } from 'svelte/transition';

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
			$game.action(row, col);
		} catch (error) {
			console.log(error);
			show_notification((error as Error).message);
		}

		$game = $game; // so that other subscribers to the store get notified
	}

	function show_notification(message: string) {
		notification.message = message;
		notification.is_visible = true;

		// Automatically hide the notification after a certain time (e.g., 3 seconds)
		setTimeout(() => {
			notification.is_visible = false;
		}, 3000);
	}

	let notification = {
		is_visible: false,
		message: ''
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

{#if notification.is_visible}
	<div
		transition:fly={{ y: 200, duration: 1000 }}
		class="fixed bottom-10 right-10 rounded-lg bg-red-700 p-4 text-white shadow-lg shadow-red-500"
	>
		<p>{notification.message}</p>
	</div>
{/if}
