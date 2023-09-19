import { _bug_test_kicking_a_cell_out } from './utils/test-scenarios';
import { Player, Turn, TurnEvent, TurnState } from './turn_state_machine';

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

export class Cell {
	marble: Marble | null = null;
	next_marble: Marble | null = null;
	is_selected: boolean = false;
	is_selectable: boolean = false;
	cell_id: number = 0; // first on the board will have 0 counting up - TODO, not implemented yet: first on outs will have -1 counting down

	// adjacents
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

	to_jsonable_object() {
		return {
			marble: this.marble,
			next_marble: this.next_marble,
			is_selected: this.is_selected,
			is_selectable: this.is_selectable,
			cell_id: this.cell_id
		};
	}

	update_from_json(update: any) {
		this.marble = update.marble;
		this.next_marble = update.next_marble;
		this.is_selected = update.is_selected;
		this.is_selectable = update.is_selectable;
		this.cell_id = update.cell_id;
	}
}

export class Marble {
	state: Player = Player.White;
	key_for_animation: number = -1;
}

export class Game {
	board: Cell[][]; // all marbles are in marble, get shifted down from next_marble
	turn: Turn = new Turn();
	outs: Cell[] = []; // all marbles are in next_marble

	action(row: number, col: number) {
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
				} else if (pressed_cell.marble?.state == this.turn.active_player) {
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
				} else if (pressed_cell.marble?.state == this.turn.active_player) {
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
						if (pressed_cell.marble == null) {
							pressed_cell.next_marble = this.turn.selected_cells[0].marble;
							this.turn.selected_cells[0].marble = null;
							pressed_cell.is_selected = !pressed_cell.is_selected;

							// toggel active player and next turn
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

					if (this.check_if_won()) this.turn.other_player_has_won = true;

					// toggel active player and next turn
					this.turn.transition(TurnEvent.move_occured, null);
				} else if (pressed_cell.marble?.state == this.turn.active_player) {
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

	reorder_board() {
		// console.log(this.deep_copy_of_board());
		this.board.flat().forEach((v) => {
			v.marble = v.next_marble != null ? v.next_marble : v.marble;
			v.next_marble = null;
		});
		// this.outs.forEach((v) => {
		// 	v.marble = v.next_marble != null ? v.next_marble : v.marble;
		// 	v.next_marble = null;
		// });
		// console.info('board and outs was reordered');
		// console.log(this.deep_copy_of_board());
	}

	constructor() {
		// this.board = []; // just because otherwise ts cries
		this.board = this.create_board();

		this.initialize_start_formation();

		// testing purposes
		// this._test_nearly_won();
		// this._test_first_nearly_out();
		// _bug_test(this);
	}

	private create_board(): Cell[][] {
		// initialize cells
		let board: Cell[][] = [];
		let cell_id_counter = 0;
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
				rowArray[col].cell_id = cell_id_counter++;
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
		let animation_id = 0;
		const generate_marble = (player: Player) => {
			return {
				state: player,
				key_for_animation: animation_id++
			};
		};

		this.board[0].forEach((v) => (v.marble = generate_marble(Player.Black)));
		this.board[1].forEach((v) => (v.marble = generate_marble(Player.Black)));
		this.board[2][2].marble = generate_marble(Player.Black);
		this.board[2][3].marble = generate_marble(Player.Black);
		this.board[2][4].marble = generate_marble(Player.Black);

		this.board[6][2].marble = generate_marble(Player.White);
		this.board[6][3].marble = generate_marble(Player.White);
		this.board[6][4].marble = generate_marble(Player.White);
		this.board[7].forEach((v) => (v.marble = generate_marble(Player.White)));
		this.board[8].forEach((v) => (v.marble = generate_marble(Player.White)));
	}

	private deep_copy_of_board(): Cell[][] {
		let board_copy: Cell[][] = this.create_board();
		for (let row in this.board) {
			for (let col in this.board[row]) {
				board_copy[row][col].marble = this.board[row][col].marble;
				board_copy[row][col].next_marble = this.board[row][col].next_marble;
				board_copy[row][col].is_selected = this.board[row][col].is_selected;
				board_copy[row][col].is_selectable = this.board[row][col].is_selectable;
			}
		}
		return board_copy;
	}

	// checks if current player has won and only if marbles which are out are exactly 5
	// -> so that if wanted you can continue to play after the game has ended
	// does not work that well, but it's fine
	private check_if_won() {
		let other_player_color = this.turn.active_player == Player.White ? Player.Black : Player.White;
		let out_marbels_of_other_player = this.outs.reduce((count, cell) => {
			if (
				cell.marble?.state == other_player_color ||
				cell.next_marble?.state == other_player_color
			) {
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
		if (this.board[row][col].marble == null) throw new Error('This should not be possible.');

		this.mark_all_cells_as_unselectable();

		let cell_color = this.board[row][col].marble?.state;
		let opposite_color = cell_color === Player.White ? Player.Black : Player.White;

		this.board[row][col].get_adjacents().forEach((v, i) => {
			if (v) {
				if (v!.marble?.state !== opposite_color) v!.is_selectable = true;
				if (
					v.marble &&
					v!.marble?.state !== opposite_color &&
					v!.get_adjacents()[i]?.marble &&
					v!.get_adjacents()[i]!.marble?.state === cell_color
				)
					// if (v.marble && v!.get_adjacents()[i]!.marble?.state === cell_color)
					v!.get_adjacents()[i]!.is_selectable = true;
			}
		});
	}

	// cell spans will only be marked as seen from either end -> otherwise it is not totally clear which direction is wanted by user
	private mark_selectable_cells_for_span(span: Cell[]) {
		span.forEach((v) => {
			if (v.marble == null) throw new Error('This should not be possible.');
		});

		this.mark_all_cells_as_unselectable();

		let cell_color = span[0].marble!.state;

		span.forEach((v) => {
			v.get_adjacents().forEach((a) => {
				if (a != null && !span.includes(a)) {
					if (a.marble?.state != cell_color && is_span_move_possible(span, a)) {
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
				defense.reverse().forEach((v) => {
					v.get_adjacents()[direction_of_move]!.next_marble = v.marble;
					v.marble = null;
				});
			} else {
				// last of defense is out
				let cell_which_holds_out_marble = new Cell();
				cell_which_holds_out_marble.next_marble = defense[defense.length - 1].marble;
				this.outs.push(cell_which_holds_out_marble);

				// from end to beginning
				defense.reverse().forEach((v) => {
					if (v.get_adjacents()[direction_of_move] == null) {
						v.marble = null;
						return;
					}
					v.get_adjacents()[direction_of_move]!.next_marble = v.marble;
					v.marble = null;
				});
			}

			// to always begin with the marble moving up front form the attacker
			if (cell_index_from_which_move_starts != 0) {
				span.reverse();
			}
			span.forEach((v, i) => {
				v.get_adjacents()[direction_of_move]!.next_marble = v.marble;
				v.marble = null;
			});
		} else {
			// Movement to the side
			span.forEach((v) => {
				v.get_adjacents()[direction_of_move]!.next_marble = v.marble;
				v.marble = null;
			});
		}
	}

	to_jsonable_object() {
		return {
			board: this.board.map((row) => row.map((cell) => cell.to_jsonable_object())),
			turn: this.turn.to_jsonable_object(),
			outs: this.outs.map((cell) => cell.to_jsonable_object())
		};
	}

	// string needs to be already parsed as JSON
	update_from_json(json_game_info: any) {
		// let parsed_game_info = JSON.parse(json_game_info);
		let parsed_game_info: any = json_game_info;
		// console.log(parsed_game_info);
		// TODO use map
		for (let index in this.board) {
			let i = parseInt(index);
			for (let twindex in this.board[i]) {
				let j = parseInt(twindex);
				this.board[i][j].update_from_json(parsed_game_info.board[i][j]);
			}
		}
		this.turn.update_from_json(parsed_game_info.turn, this);

		this.outs = [];
		for (let index in parsed_game_info.outs) {
			let i = parseInt(index);
			this.outs.push(new Cell());
			this.outs[i].update_from_json(parsed_game_info.outs[i]);
		}
	}

	find_cell_by_id(cell_id: number): Cell {
		if (cell_id < 0) {
			throw Error('not impl yet');
		}
		const cell = this.board.flat().find((v) => {
			return v.cell_id === cell_id;
		});
		if (cell === undefined) throw Error('find impl is not correct');
		return cell;
	}
}

function is_span_selection_possible(from_cell: Cell, to_cell: Cell): [boolean, number, SpanLength] {
	let color = from_cell.marble!.state;

	let result: [boolean, number, SpanLength] = [false, -1, SpanLength.One];
	from_cell.get_adjacents().forEach((v, i) => {
		if (v?.marble?.state == color) {
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
		if (to.marble == null) return true;
		if (to.marble.state != span[0].marble?.state) {
			return is_sumito_possible(span, to, direction_of_possible_move);
		}
	} else {
		// are all needed cells empty
		let result = true;
		span.forEach((v, i) => {
			if (v.get_adjacents()[direction_of_possible_move]?.marble != null) {
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
	let own_color = span[0].marble!.state == Player.White ? Player.White : Player.Black;
	if (
		defense[defense.length - 1].get_adjacents()[direction_of_possible_move]?.marble?.state ==
		own_color
	)
		defense_value = SpanLength.Three;

	if (span.length > defense_value) return true;
	return false;
}

function get_defense(to: Cell, direction_of_possible_move: Direction): Cell[] {
	if (to.marble == null) return [];
	let defense = [to];
	let tmp = to;
	while (tmp.get_adjacents()[direction_of_possible_move]?.marble?.state == to.marble.state) {
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
