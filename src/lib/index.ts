import { Player, Turn, TurnEvent, TurnState } from './turn_state_machine';

export enum OwnColors {
	White = 'bg-fuchsia-800',
	Black = 'bg-teal-800'
}

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

	is_adjacent(cell: Cell) {
		return this.get_adjacents().includes(cell);
	}
}

export class Game {
	board: Cell[][];
	turn: Turn = new Turn();

	action(row: number, col: number) {
		const board_copy = this.deep_copy_of_board(); // cuz ts is not that great and has no deep_copy?

		const pressed_cell = this.board[row][col];
		{
			let tmp_is_selected = !pressed_cell.is_selected;
			this.clear_selected_and_selectable();
			pressed_cell.is_selected = tmp_is_selected;
		}

		switch (this.turn.get_turn_state()) {
			case TurnState.no_cell_selected:
				// before no cell was selected, now it is
				if (pressed_cell.is_selected == false && this.turn.selected_cells == null)
					throw new Error('Should not be possible');

				if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					this.mark_selectable_cells(row, col);
					this.turn.transition(TurnEvent.own_cell_selected, pressed_cell);
				} else {
					this.turn.transition(TurnEvent.other_cell_selected, pressed_cell);
				}
				break;
			case TurnState.own_cell_selected:
				// before an own cell was selected so now an move is possible
				if (pressed_cell == this.turn.selected_cells) {
					this.turn.transition(TurnEvent.cell_deselected, null);
				} else if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					if (this.is_span_selection_possible()) {
						('asdfasdf');
					} else {
						this.mark_selectable_cells(row, col);
						this.turn.transition(TurnEvent.own_cell_selected, pressed_cell);
					}
				} else {
					// if move or just another cell selected
					if (this.turn.selected_cells?.is_adjacent(pressed_cell)) {
						// move
						if (pressed_cell.state == CellState.Empty) {
							pressed_cell.state = this.turn.selected_cells.state;
							this.turn.selected_cells.state = CellState.Empty;
							pressed_cell.is_selected = !pressed_cell.is_selected;

							// toggel active player and next turn
							this.turn.active_player =
								this.turn.active_player == Player.White ? Player.Black : Player.White;
							this.turn.transition(TurnEvent.move_occured, null);
						} else {
							// move is illegal, display error, leave the rest
							let [turn_row, turn_col] = this.get_indexes_of_cell(this.turn.selected_cells)!;
							this.board = board_copy;
							this.turn.selected_cells = this.board[turn_row][turn_col];
							throw new Error('This turn is illegal');
						}
					} else {
						this.turn.transition(TurnEvent.other_cell_selected, pressed_cell);
					}
				}
				break;
			case TurnState.other_cell_selected:
				// before an other cell was selected
				if (pressed_cell == this.turn.selected_cells) {
					this.turn.transition(TurnEvent.cell_deselected, null);
				} else if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					this.mark_selectable_cells(row, col);
					this.turn.transition(TurnEvent.own_cell_selected, pressed_cell);
				} else {
					this.turn.transition(TurnEvent.other_cell_selected, pressed_cell);
				}
				break;
			case TurnState.own_span_of_cells_selected:
				// this.own_span_of_cells_selected_handler(event);
				break;
			default:
				throw new Error('This is not supposed to happen!');
		}
	}

	constructor() {
		// this.board = []; // just because otherwise ts cries
		this.board = this.create_board();

		this.initialize_start_formation();

		// testing purposes
		this.board![0][0].state = CellState.Black;
		this.board![8][4].state = CellState.White;
	}

	private create_board(): Cell[][] {
		// initialize cells
		let board: Cell[][] = [];
		board.push(create_row(5));
		board.push(create_row(6));
		board.push(create_row(7));
		board.push(create_row(8));
		board.push(create_row(9));
		board.push(create_row(8));
		board.push(create_row(7));
		board.push(create_row(6));
		board.push(create_row(5));

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
				let cur_row = board[0];
				let below_row = board[1];
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
				const above_row = board[row - 1];
				const cur_row = board[row];
				const below_row = board[row + 1];
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
				const above_row = board[row - 1];
				const cur_row = board[row];
				const below_row = board[row + 1];
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
				const above_row = board[row - 1];
				const cur_row = board[row];
				const below_row = board[row + 1];
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
				const above_row = board[row - 1];
				const cur_row = board[row];
				const below_row = board[row + 1];
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
		return board;
	}

	private initialize_start_formation() {
		this.board[0].forEach((v) => (v.state = CellState.Black));
		this.board[1].forEach((v) => (v.state = CellState.Black));
		this.board[2][2].state = CellState.Black;
		this.board[2][3].state = CellState.Black;
		this.board[2][4].state = CellState.Black;

		this.board[6][2].state = CellState.White;
		this.board[6][3].state = CellState.White;
		this.board[6][4].state = CellState.White;
		this.board[7].forEach((v) => (v.state = CellState.White));
		this.board[8].forEach((v) => (v.state = CellState.White));
	}

	private deep_copy_of_board(): Cell[][] {
		let board_copy: Cell[][] = this.create_board();
		for (let row in this.board) {
			for (let col in this.board[row]) {
				board_copy[row][col].state = this.board[row][col].state;
				board_copy[row][col].is_selected = this.board[row][col].is_selected;
				board_copy[row][col].is_selectable = this.board[row][col].is_selectable;
			}
		}
		return board_copy;
	}

	// length of return is always 2
	private get_indexes_of_cell(cell: Cell): number[] | null {
		for (let row in this.board) {
			for (let col in this.board[row]) {
				if (this.board[row][col] == cell) return [parseInt(row), parseInt(col)];
			}
		}
		return null;
	}

	is_span_selection_possible() {
		return false;
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

	clear_selected_and_selectable() {
		this.board.flat().forEach((value) => {
			value.is_selected = false;
			value.is_selectable = false;
		});
	}

	// this function is only called on non empty cells, that exist
	mark_selectable_cells(row: number, col: number) {
		if (this.board[row][col].state == CellState.Empty)
			throw new Error('This should not be possible.');

		this.mark_all_cells_as_unselectable();

		let cell_color = this.board[row][col].state;
		let opposite_color = cell_color == CellState.White ? CellState.Black : CellState.White;

		if (this.board[row][col].tl) {
			if (this.board[row][col].tl!.state != opposite_color)
				this.board[row][col].tl!.is_selectable = true;
			if (this.board[row][col].tl!.tl && this.board[row][col].tl!.tl!.state == cell_color)
				this.board[row][col].tl!.tl!.is_selectable = true;
		}
		if (this.board[row][col].tr) {
			if (this.board[row][col].tr!.state != opposite_color)
				this.board[row][col].tr!.is_selectable = true;
			if (this.board[row][col].tr!.tr && this.board[row][col].tr!.tr!.state == cell_color)
				this.board[row][col].tr!.tr!.is_selectable = true;
		}
		if (this.board[row][col].left) {
			if (this.board[row][col].left!.state != opposite_color)
				this.board[row][col].left!.is_selectable = true;
			if (this.board[row][col].left!.left && this.board[row][col].left!.left!.state == cell_color)
				this.board[row][col].left!.left!.is_selectable = true;
		}
		if (this.board[row][col].right) {
			if (this.board[row][col].right!.state != opposite_color)
				this.board[row][col].right!.is_selectable = true;
			if (
				this.board[row][col].right!.right &&
				this.board[row][col].right!.right!.state == cell_color
			)
				this.board[row][col].right!.right!.is_selectable = true;
		}
		if (this.board[row][col].bl) {
			if (this.board[row][col].bl!.state != opposite_color)
				this.board[row][col].bl!.is_selectable = true;
			if (this.board[row][col].bl!.bl && this.board[row][col].bl!.bl!.state == cell_color)
				this.board[row][col].bl!.bl!.is_selectable = true;
		}
		if (this.board[row][col].br) {
			if (this.board[row][col].br!.state != opposite_color)
				this.board[row][col].br!.is_selectable = true;
			if (this.board[row][col].br!.br && this.board[row][col].br!.br!.state == cell_color)
				this.board[row][col].br!.br!.is_selectable = true;
		}
	}
}
