export enum TurnState {
	no_cell_selected,
	own_cell_selected,
	other_cell_selected,
	own_span_of_cells_selected,
	end_of_turn
}

export enum TurnEvent {
	own_cell_selected,
	other_cell_selected,
	span_selected,
	cell_deselected,
	move_occured,
	turn_over
}

export class Turn {
	private turn_state: TurnState = TurnState.no_cell_selected;

	transition(event: TurnEvent) {
		switch (this.turn_state) {
			case TurnState.no_cell_selected:
				this.no_cell_selected_handler(event);
				break;
			case TurnState.own_cell_selected:
				this.own_cell_selected_handler(event);
				break;
			case TurnState.other_cell_selected:
				this.other_cell_selected_handler(event);
				break;
			case TurnState.own_span_of_cells_selected:
				this.own_span_of_cells_selected_handler(event);
				break;
			case TurnState.end_of_turn:
				this.end_of_turn_handler(event);
				break;
			default:
				throw new Error('This is not supposed to happen!');
				break;
		}
	}

	private no_cell_selected_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.own_cell_selected:
				this.turn_state = TurnState.own_cell_selected;
				break;
			case TurnEvent.other_cell_selected:
				this.turn_state = TurnState.other_cell_selected;
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
				this.turn_state = TurnState.other_cell_selected;
				break;
			case TurnEvent.span_selected:
				this.turn_state = TurnState.own_span_of_cells_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_cell_selected;
				break;
			case TurnEvent.move_occured:
				this.turn_state = TurnState.end_of_turn;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}

	private other_cell_selected_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.own_cell_selected:
				this.turn_state = TurnState.own_cell_selected;
				break;
			case TurnEvent.other_cell_selected:
				this.turn_state = TurnState.other_cell_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_cell_selected;
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
				this.turn_state = TurnState.other_cell_selected;
				break;
			case TurnEvent.cell_deselected:
				this.turn_state = TurnState.no_cell_selected;
				break;
			case TurnEvent.move_occured:
				this.turn_state = TurnState.end_of_turn;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}

	private end_of_turn_handler(event: TurnEvent) {
		switch (event) {
			case TurnEvent.turn_over:
				this.turn_state = TurnState.no_cell_selected;
				break;
			default:
				throw new Error('This transition is not allowed!');
		}
	}
}
