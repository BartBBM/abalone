import type { Cell, Game } from '$lib';

export enum Player {
	White = 'white',
	Black = 'black'
}

export enum TurnState {
	no_or_other_cell_selected,
	own_cell_selected,
	own_span_of_cells_selected
}

export enum TurnEvent {
	own_cell_selected,
	other_cell_selected,
	span_selected,
	cell_deselected, // not necessary since equivalent to other_cell_selected, but nice
	move_occured
}

export class Turn {
	/**
	 * This turn state machine does nothing than track the current state of a turn and check if the events that happen are valid.
	 * The transition function has no side effect other than if a 'move_occured' to also toggle the active player.
	 */

	private turn_state: TurnState = TurnState.no_or_other_cell_selected;
	active_player: Player = Player.White;
	selected_cells: Cell[] | null = null;

	to_jsonable_object() {
		return {
			turn_state: this.turn_state,
			active_player: this.active_player,
			selected_cells: this.selected_cells?.map((c) => c.to_jsonable_object())
		};
	}

	update_from_json(update: any, game: Game) {
		this.turn_state = update.turn_state;
		this.active_player = update.active_player;

		if (update.selected_cells === null) {
			this.selected_cells = null;
			return;
		}
		this.selected_cells = [];

		// what happens when no element in selected cells
		for (let index in update.selected_cells) {
			let i = parseInt(index);
			this.selected_cells.push(game.find_cell_by_id(update.selected_cells[i].cell_id));
		}
	}

	transition(event: TurnEvent, selected_cells: Cell[] | null) {
		this.selected_cells = selected_cells;
		switch (this.turn_state) {
			case TurnState.no_or_other_cell_selected:
				this.no_or_other_cell_selected_handler(event);
				break;
			case TurnState.own_cell_selected:
				this.own_cell_selected_handler(event);
				break;
			case TurnState.own_span_of_cells_selected:
				this.own_span_of_cells_selected_handler(event);
				break;
			default:
				throw new Error('This is not supposed to happen!');
		}
	}

	get_turn_state() {
		return this.turn_state;
	}

	private no_or_other_cell_selected_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.own_cell_selected:
				this.turn_state = TurnState.own_cell_selected;
				break;
			case TurnEvent.other_cell_selected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}

	private own_cell_selected_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.own_cell_selected:
				this.turn_state = TurnState.own_cell_selected;
				break;
			case TurnEvent.other_cell_selected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			case TurnEvent.span_selected:
				this.turn_state = TurnState.own_span_of_cells_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			case TurnEvent.move_occured:
				this.active_player = this.active_player == Player.White ? Player.Black : Player.White;
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}

	private own_span_of_cells_selected_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.own_cell_selected:
				this.turn_state = TurnState.own_cell_selected;
				break;
			case TurnEvent.other_cell_selected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			case TurnEvent.move_occured:
				this.active_player = this.active_player == Player.White ? Player.Black : Player.White;
				this.turn_state = TurnState.no_or_other_cell_selected;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}
}
