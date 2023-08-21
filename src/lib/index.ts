import { Player, Turn, TurnEvent, TurnState } from './turn_state_machine';

export enum OwnColors {
	White = 'bg-fuchsia-800',
	Black = 'bg-teal-800'
}

export enum SpanLength {
	One = 1,
	Two,
	Three
}

export enum SpanMoveCase {
	Line,
	Side
}

export enum Direction {
	tl,
	tr,
	left,
	right,
	bl,
	br
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

	is_adjacent(cells: Cell[]) {
		let result: boolean = false;
		cells.forEach((v) => {
			if (this.get_adjacents().includes(v) == true) result = true;
		});
		return result;
	}
}

export class Game {
	board: Cell[][];
	turn: Turn = new Turn();
	outs: Cell[] = [];

	action(row: number, col: number): Player | undefined {
		const board_copy = this.deep_copy_of_board(); // cuz ts is not that great and has no deep_copy?

		const pressed_cell = this.board[row][col];
		{
			let tmp_is_selected = !pressed_cell.is_selected;
			this.clear_selected_and_selectable();
			pressed_cell.is_selected = tmp_is_selected;
		}

		switch (this.turn.get_turn_state()) {
			case TurnState.no_or_other_cell_selected:
				// before no or an other cell was selected
				if (pressed_cell == this.turn.selected_cells?.[0]) {
					this.turn.transition(TurnEvent.cell_deselected, null);
				} else if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					this.mark_selectable_cells_for_single_cell(row, col);
					this.turn.transition(TurnEvent.own_cell_selected, [pressed_cell]);
				} else {
					this.turn.transition(TurnEvent.other_cell_selected, [pressed_cell]);
				}
				break;
			case TurnState.own_cell_selected:
				// before an own cell was selected so now an move is possible
				if (pressed_cell == this.turn.selected_cells?.[0]) {
					this.turn.transition(TurnEvent.cell_deselected, null);
				} else if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					let [is_possible, index, amount] = is_span_selection_possible(
						this.turn.selected_cells![0],
						pressed_cell
					);
					if (is_possible) {
						let selected_cells: Cell[] = [
							this.turn.selected_cells![0],
							this.turn.selected_cells![0].get_adjacents()[index]!
						];
						if (amount == SpanLength.Three)
							selected_cells.push(
								this.turn.selected_cells![0].get_adjacents()[index]!.get_adjacents()[index]!
							);
						this.mark_selectable_cells_for_span(selected_cells);
						selected_cells.forEach((v) => (v.is_selected = true));
						this.turn.transition(TurnEvent.span_selected, selected_cells);
					} else {
						this.mark_selectable_cells_for_single_cell(row, col);
						this.turn.transition(TurnEvent.own_cell_selected, [pressed_cell]);
					}
				} else {
					// if move or just another cell selected
					if (this.turn.selected_cells?.[0].is_adjacent([pressed_cell])) {
						// move
						if (pressed_cell.state == CellState.Empty) {
							pressed_cell.state = this.turn.selected_cells[0].state;
							this.turn.selected_cells[0].state = CellState.Empty;
							pressed_cell.is_selected = !pressed_cell.is_selected;

							// toggel active player and next turn
							this.turn.active_player =
								this.turn.active_player == Player.White ? Player.Black : Player.White;
							this.turn.transition(TurnEvent.move_occured, null);
						} else {
							// move is illegal, display error, leave the rest
							let [turn_row, turn_col] = this.get_indexes_of_cell(this.turn.selected_cells[0])!;
							this.board = board_copy;
							this.turn.selected_cells = [this.board[turn_row][turn_col]];
							throw new Error('This turn is illegal');
						}
					} else {
						this.turn.transition(TurnEvent.other_cell_selected, [pressed_cell]);
					}
				}
				break;
			case TurnState.own_span_of_cells_selected:
				// there was a span selected, and now another cell got selected
				if (this.turn.selected_cells!.includes(pressed_cell)) {
					this.turn.transition(TurnEvent.cell_deselected, null);
				} else if (
					pressed_cell.is_adjacent(this.turn.selected_cells!) &&
					is_span_move_possible(this.turn.selected_cells!, pressed_cell)
				) {
					this.span_move(this.turn.selected_cells!, pressed_cell);
					pressed_cell.is_selected = !pressed_cell.is_selected;

					if (this.check_if_won()) return this.turn.active_player;

					// toggel active player and next turn
					this.turn.active_player =
						this.turn.active_player == Player.White ? Player.Black : Player.White;
					this.turn.transition(TurnEvent.move_occured, null);
				} else if (pressed_cell.state == (this.turn.active_player as unknown as CellState)) {
					this.mark_selectable_cells_for_single_cell(row, col);
					this.turn.transition(TurnEvent.own_cell_selected, [pressed_cell]);
				} else {
					this.turn.transition(TurnEvent.other_cell_selected, [pressed_cell]);
				}
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
		this._test_nearly_won();
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

	private _test_nearly_won() {
		this.action(8, 2);
		this.action(6, 4);
		this.action(5, 5);
		this.action(0, 3);
		this.action(1, 4);
		this.action(2, 5);
		this.action(0, 4);
		this.action(7, 3);
		this.action(5, 5);
		this.action(4, 6);
		this.action(0, 4);
		this.action(1, 5);
		this.action(2, 6);
		this.action(8, 3);
		this.action(7, 4);
		this.action(6, 5);
		this.action(1, 4);
		this.action(2, 5);
		this.action(3, 6);
		this.action(6, 4);
		this.action(4, 6);
		this.action(3, 6);
		this.action(1, 2);
		this.action(1, 3);
		this.action(1, 4);
		this.action(5, 5);
		this.action(3, 6);
		this.action(2, 6);
		this.action(0, 2);
		this.action(0, 3);
		this.action(2, 6);
		this.action(4, 6);
		this.action(5, 5);
		this.action(1, 5);
		this.action(2, 6);
		this.action(5, 5);
		this.action(3, 6);
		this.action(2, 6);
		this.action(2, 4);
		this.action(2, 5);
		this.action(2, 6);
		this.action(4, 6);
		this.action(3, 6);
		this.action(2, 6);
		this.action(2, 5);
		this.action(1, 5);
		this.action(2, 6);
		this.action(3, 6);
		this.action(4, 6);
		this.action(1, 5);
		this.action(2, 6);
		// this would win
		// this.action(4, 6);
		// this.action(3, 6);
		// this.action(2, 6);
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

	private check_if_won() {
		let other_player_color =
			this.turn.active_player == Player.White ? CellState.Black : CellState.White;
		let out_marbels_of_other_player = this.outs.reduce((count, cell) => {
			if (cell.state == other_player_color) {
				return count + 1;
			}
			return count;
		}, 0);
		if (out_marbels_of_other_player == 5) {
			return true;
		}
		return false;
	}

	// length of return is always 2 = [row, col]
	private get_indexes_of_cell(cell: Cell): number[] | null {
		for (let row in this.board) {
			for (let col in this.board[row]) {
				if (this.board[row][col] == cell) return [parseInt(row), parseInt(col)];
			}
		}
		return null;
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
	mark_selectable_cells_for_single_cell(row: number, col: number) {
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

	// cell spans will only be marked as seen from either end -> otherwise it is not totally clear which direction is wanted by user
	private mark_selectable_cells_for_span(span: Cell[]) {
		span.forEach((v) => {
			if (v.state == CellState.Empty) throw new Error('This should not be possible.');
		});

		this.mark_all_cells_as_unselectable();
		let cell_color = span[0].state;
		let opposite_color = cell_color == CellState.White ? CellState.Black : CellState.White;

		span.forEach((v) => {
			v.get_adjacents().forEach((a) => {
				if (a != null && !span.includes(a)) {
					if (a.state != cell_color && is_span_move_possible(span, a)) {
						a.is_selectable = true;
					}
				}
			});
		});
	}

	// span move is possible
	private span_move(span: Cell[], to: Cell) {
		let direction_of_span: Direction = get_direction_of_span(span);
		let [direction_of_move, cell_index_from_which_move_starts] = get_direction_of_possible_move(
			span,
			to
		);
		let move_case: SpanMoveCase = get_move_case(direction_of_span, direction_of_move);

		if (move_case == SpanMoveCase.Line) {
			let defense = get_defense(to, direction_of_move);
			if (defense.length == 0) 'do nothing, and do not check the other if conditions';
			else if (defense[defense.length - 1].get_adjacents()[direction_of_move] != null) {
				// push them away normally
				for (let i = defense.length - 1; i >= 0; --i) {
					defense[i].get_adjacents()[direction_of_move]!.state = defense[i].state;
				}
			} else {
				// last of defense is out
				let cell_which_is_out = new Cell();
				cell_which_is_out.state =
					this.turn.active_player == Player.White ? CellState.Black : CellState.White;
				this.outs.push(cell_which_is_out);

				// from end to beginning
				defense.reverse().forEach((v) => {
					v.state = v.get_adjacents()[inverse_direction(direction_of_move)]!.state;
				});
			}

			if (cell_index_from_which_move_starts != 0) {
				span.reverse();
			}
			span.forEach((v, i) => {
				if (i == span.length - 1) {
					v.state = CellState.Empty;
				} else {
					v.get_adjacents()[direction_of_move]!.state = v.state;
				}
			});
		} else {
			// Movement to the side
			span.forEach((v) => {
				v.get_adjacents()[direction_of_move]!.state = v.state;
				v.state = CellState.Empty;
			});
		}
	}
}

function is_span_selection_possible(from_cell: Cell, to_cell: Cell): [boolean, number, SpanLength] {
	let color = from_cell.state;

	let result: [boolean, number, SpanLength] = [false, -1, SpanLength.One];
	from_cell.get_adjacents().forEach((v, i) => {
		if (v?.state == color) {
			if (v == to_cell) result = [true, i, SpanLength.Two];
			if (v.get_adjacents()[i] != null && v.get_adjacents()[i] == to_cell)
				result = [true, i, SpanLength.Three];
		}
	});

	return result;
}

// only called on valid pairs of span and to
function is_span_move_possible(span: Cell[], to: Cell): boolean {
	let direction_of_span: Direction = get_direction_of_span(span);
	let [direction_of_possible_move, cell_index_from_which_move_starts] =
		get_direction_of_possible_move(span, to);

	let move_case: SpanMoveCase = get_move_case(direction_of_span, direction_of_possible_move);

	if (move_case == SpanMoveCase.Line) {
		if (span[cell_index_from_which_move_starts].get_adjacents()[direction_of_possible_move]! != to)
			throw new Error('Grug brain');
		if (to.state == CellState.Empty) return true;
		if (to.state != span[0].state) {
			return is_sumito_possible(span, to, direction_of_possible_move);
		}
	} else {
		// are all needed cells empty
		let result = true;
		span.forEach((v, i) => {
			if (v.get_adjacents()[direction_of_possible_move]?.state != CellState.Empty) {
				result = false;
			}
		});

		// is move unambiguous
		if (span[0].get_adjacents().includes(to) && span[span.length - 1].get_adjacents().includes(to))
			result = false;

		return result;
	}
	return false;
}

// here everything else is checked, just needs to check if span is longer than opponents defense
export function is_sumito_possible(
	span: Cell[],
	to: Cell,
	direction_of_possible_move: Direction
): boolean {
	// create a span from to in direction_of_possible_move
	let defense = get_defense(to, direction_of_possible_move);
	let defense_value: SpanLength =
		defense.length <= SpanLength.Three ? defense.length : SpanLength.Three;
	let own_color = span[0].state == CellState.White ? CellState.White : CellState.Black;
	if (defense[defense.length - 1].get_adjacents()[direction_of_possible_move]?.state == own_color)
		defense_value = SpanLength.Three;

	if (span.length > defense_value) return true;
	return false;
}

function get_defense(to: Cell, direction_of_possible_move: Direction): Cell[] {
	if (to.state == CellState.Empty) return [];
	let defense = [to];
	let tmp = to;
	while (tmp.get_adjacents()[direction_of_possible_move]?.state == to.state) {
		tmp = tmp.get_adjacents()[direction_of_possible_move]!;
		defense.push(tmp);
	}
	return defense;
}

function get_move_case(
	direction_of_span: Direction,
	direction_of_possible_move: Direction
): SpanMoveCase {
	let normalized_direction_of_span: Direction = normalize_direction(direction_of_span);
	let normalized_direction_of_possible_move: Direction = normalize_direction(
		direction_of_possible_move
	);
	if (normalized_direction_of_span == normalized_direction_of_possible_move)
		return SpanMoveCase.Line;
	return SpanMoveCase.Side;
}

function normalize_direction(dir: Direction): Direction {
	switch (dir) {
		case Direction.tl:
			return Direction.tl;
		case Direction.tr:
			return Direction.tr;
		case Direction.left:
			return Direction.left;
		case Direction.right:
			return Direction.left;
		case Direction.bl:
			return Direction.tr;
		case Direction.br:
			return Direction.tl;
		default:
			throw new Error('Impl Error');
	}
}

function inverse_direction(dir: Direction): Direction {
	switch (dir) {
		case Direction.tl:
			return Direction.br;
		case Direction.tr:
			return Direction.bl;
		case Direction.left:
			return Direction.right;
		case Direction.right:
			return Direction.left;
		case Direction.bl:
			return Direction.tr;
		case Direction.br:
			return Direction.tl;
		default:
			throw new Error('Impl Error');
	}
}

export function get_direction_of_possible_move(span: Cell[], to: Cell): [Direction, number] {
	let result: [Direction, number] | null = null;
	span.forEach((v, i) => {
		if (span.length == 3 && i == 1) return;
		let index = v.get_adjacents().indexOf(to);
		if (index != -1) {
			result = [index as Direction, i];
		}
	});

	if (result == null) throw new Error('This function was called in a wrong situation!');

	return result;
}

function get_direction_of_span(span: Cell[]): Direction {
	return span[0].get_adjacents().indexOf(span[1]) as Direction;
}
