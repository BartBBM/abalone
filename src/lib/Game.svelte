<script lang="ts">
	enum CellState {
		Empty = 'E',
		White = 'W',
		Black = 'B'
	}

	class Game {
		board: CellState[][];

		constructor() {
			this.board = [];
			this.board.push(create_row(5));
			this.board.push(create_row(6));
			this.board.push(create_row(7));
			this.board.push(create_row(8));
			this.board.push(create_row(9));
			this.board.push(create_row(8));
			this.board.push(create_row(7));
			this.board.push(create_row(6));
			this.board.push(create_row(5));

			function create_row(length: number): CellState[] {
				const rowArray: CellState[] = [];
				for (let col = 0; col < length; col++) {
					rowArray.push(CellState.Empty);
				}
				return rowArray;
			}

			// testing purposes
			this.board[0][0] = CellState.Black;
			this.board[8][4] = CellState.White;
		}
	}

	let game = new Game();

	function background_of_cell(cell_state: CellState): String {
		if (cell_state == CellState.White) {
			return '';
		}
	}
</script>

<div class="grid">
	<!-- {#each game.board as row, rowIndex}
		{#each row as cell, colIndex}
			<div class="cell" style="grid-column: {colIndex + 1}; grid-row: {rowIndex + 1};">
				<span>{cell}</span>
			</div>
		{/each}
	{/each} -->
	{#each game.board as row, rowIndex}
		{#each row as cell, colIndex}
			<div
				class="h-16 w-16 rounded-full border-2 border-black"
				style="grid-column: {colIndex + 1}; grid-row: {rowIndex + 1};"
			>
				<span>{cell}</span>
			</div>
		{/each}
	{/each}
</div>
