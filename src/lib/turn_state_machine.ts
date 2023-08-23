import type { Cell } from '$lib';

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
