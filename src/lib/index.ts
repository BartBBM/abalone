import { assert } from 'vitest';
import { Turn, TurnEvent, TurnState } from './turn_state_machine';

export enum CellState {
	White = 'white',
	Black = 'black',
	Empty = 'empty'
}

export class Cell {
	state: CellState = CellState.Empty;
	is_selected: boolean = false;
	is_selectable: boolean = false;
	tl: Cell | null = null;
	tr: Cell | null = null;
	left: Cell | null = null;
	right: Cell | null = null;
	bl: Cell | null = null;
	br: Cell | null = null;

	get_adjacents() {
		return [this.tl, this.tr, this.left, this.right, this.bl, this.br];
	}
}

export class Game {
	board: Cell[][];
	turn: Turn = new Turn();

	action(row: number, col: number) {
		const pressed_cell = this.board[row][col];
		pressed_cell.is_selected = !pressed_cell.is_selected;

		switch (this.turn.get_turn_state()) {
			case TurnState.no_cell_selected:
				// before no cell was selected, now it is
				assert(pressed_cell.is_selected == true);

				if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					this.mark_selectable_cells(row, col);
					this.turn.transition(TurnEvent.own_cell_selected);
				} else {
					this.turn.transition(TurnEvent.other_cell_selected);
				}
				break;
			case TurnState.own_cell_selected:
				// this.own_cell_selected_handler(event);
				break;
			case TurnState.other_cell_selected:
				// this.other_cell_selected_handler(event);
				break;
			case TurnState.own_span_of_cells_selected:
				// this.own_span_of_cells_selected_handler(event);
				break;
			case TurnState.end_of_turn:
				// this.end_of_turn_handler(event);
				break;
			default:
				throw new Error('This is not supposed to happen!');
		}

		/* if (
			this.game_state == GameState.black_selected ||
			this.game_state == GameState.white_selected
		) {
			// a colored was selected before
			if (is_selected == true) {
				// maybe move cell now
				if (cell_state != this.latest_selected_cell!.state) {
					if (
						this.latest_selected_cell!.get_adjacents().some(
							(value) => value == this.board[row][col]
						)
					) {
						this.board[row][col].state = this.latest_selected_cell!.state;
						this.latest_selected_cell!.state = CellState.Empty;
						this.mark_all_cells_as_unselectable();
						this.remove_any_other_selected_cells([]);
						is_selected = !is_selected;
						this.board[row][col].is_selected = is_selected;
						this.game_state = GameState.no_cell_selected;
					}
				}
				// missing logic here
			} else {
				// same colored cell was selected again
				this.mark_all_cells_as_unselectable();
			}
		} else {
			if (is_selected == true) {
				this.remove_any_other_selected_cells([[row, col]]);
				this.mark_selectable_cells(row, col);
				if (this.board[row][col].state != CellState.Empty)
					this.game_state =
						cell_state == CellState.White ? GameState.white_selected : GameState.black_selected;
			} else {
				this.mark_all_cells_as_unselectable();
			}
		}

		this.latest_selected_cell = is_selected ? this.board[row][col] : null; */
	}

	constructor() {
		// initialize cells
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

		function create_row(length: number): Cell[] {
			const rowArray: Cell[] = [];
			for (let col = 0; col < length; col++) {
				rowArray.push(new Cell());
			}
			return rowArray;
		}

		// initialize adjacents
		{
			{
				let above_row = null; // for top
				let cur_row = this.board[0];
				let below_row = this.board[1];
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].left = cur_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].right = cur_row[i + 1];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].bl = below_row[i];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].br = below_row[i + 1];
				}
			}
			// obviously only does not crash for the three top middle rows
			const initialize_adjacents_for_top_middle_rows = (row: number) => {
				const above_row = this.board[row - 1];
				const cur_row = this.board[row];
				const below_row = this.board[row + 1];
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].tl = above_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].tr = above_row[i];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].left = cur_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].right = cur_row[i + 1];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].bl = below_row[i];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].br = below_row[i + 1];
				}
			};
			initialize_adjacents_for_top_middle_rows(1);
			initialize_adjacents_for_top_middle_rows(2);
			initialize_adjacents_for_top_middle_rows(3);
			{
				let row = 4; // middle row
				const above_row = this.board[row - 1];
				const cur_row = this.board[row];
				const below_row = this.board[row + 1];
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].tl = above_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].tr = above_row[i];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].left = cur_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].right = cur_row[i + 1];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].bl = below_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].br = below_row[i];
				}
			}
			// obviously only does not crash for the three bottom middle rows
			const initialize_adjacents_for_bottom_middle_rows = (row: number) => {
				const above_row = this.board[row - 1];
				const cur_row = this.board[row];
				const below_row = this.board[row + 1];
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].tl = above_row[i];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].tr = above_row[i + 1];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].left = cur_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].right = cur_row[i + 1];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].bl = below_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].br = below_row[i];
				}
			};
			initialize_adjacents_for_bottom_middle_rows(5);
			initialize_adjacents_for_bottom_middle_rows(6);
			initialize_adjacents_for_bottom_middle_rows(7);
			{
				let row = 8; // bottom row
				const above_row = this.board[row - 1];
				const cur_row = this.board[row];
				const below_row = this.board[row + 1];
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].tl = above_row[i];
				}
				for (let i = 0; i < cur_row.length; ++i) {
					cur_row[i].tr = above_row[i + 1];
				}
				for (let i = 1; i < cur_row.length; ++i) {
					cur_row[i].left = cur_row[i - 1];
				}
				for (let i = 0; i < cur_row.length - 1; ++i) {
					cur_row[i].right = cur_row[i + 1];
				}
			}
		}

		// testing purposes
		this.board[0][0].state = CellState.Black;
		this.board[8][4].state = CellState.White;
	}

	remove_any_other_selected_cells(cells_not_to: [number, number][]) {
		for (let i in this.board) {
			for (let j in this.board[i]) {
				if (!cells_not_to.some((cell) => cell[0] == parseInt(i) && cell[1] == parseInt(j)))
					this.board[i][j].is_selected = false;
			}
		}
	}

	mark_all_cells_as_unselectable() {
		this.board.flat().forEach((value) => (value.is_selectable = false));
	}

	mark_selectable_cells(row: number, col: number) {
		this.mark_all_cells_as_unselectable();

		// can be written more beautiful
		if (this.board[row][col].tl) this.board[row][col].tl!.is_selectable = true;
		if (this.board[row][col].tr) this.board[row][col].tr!.is_selectable = true;
		if (this.board[row][col].left) this.board[row][col].left!.is_selectable = true;
		if (this.board[row][col].right) this.board[row][col].right!.is_selectable = true;
		if (this.board[row][col].bl) this.board[row][col].bl!.is_selectable = true;
		if (this.board[row][col].br) this.board[row][col].br!.is_selectable = true;
	}
}
