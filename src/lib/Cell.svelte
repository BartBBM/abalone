<script lang="ts">
	import { Cell, CellState, GameState } from '$lib/index';
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
		is_selected = !is_selected;
		$game.board[row][col].is_selected = is_selected;

		if (
			$game.game_state == GameState.black_selected ||
			$game.game_state == GameState.white_selected
		) {
			// a colored was selected before
			if (is_selected == true) {
				// maybe move cell now
				if (cell_state != $game.latest_selected_cell!.state) {
					if (
						$game
							.latest_selected_cell!.get_adjacents()
							.some((value) => value == $game.board[row][col])
					) {
						$game.board[row][col].state = $game.latest_selected_cell!.state;
						$game.latest_selected_cell!.state = CellState.Empty;
						$game.mark_all_cells_as_unselectable();
						$game.remove_any_other_selected_cells([]);
						is_selected = !is_selected;
						$game.board[row][col].is_selected = is_selected;
						$game.game_state = GameState.no_cell_selected;
					}
				}
				// missing logic here
			} else {
				// same colored cell was selected again
				$game.mark_all_cells_as_unselectable();
			}
		} else {
			if (is_selected == true) {
				$game.remove_any_other_selected_cells([[row, col]]);
				$game.mark_selectable_cells(row, col);
				if ($game.board[row][col].state != CellState.Empty)
					$game.game_state =
						cell_state == CellState.White ? GameState.white_selected : GameState.black_selected;
			} else {
				$game.mark_all_cells_as_unselectable();
			}
		}

		$game.latest_selected_cell = is_selected ? $game.board[row][col] : null;
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
