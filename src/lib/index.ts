export enum CellState {
	Empty,
	White,
	Black
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
}

export class Game {
	board: Cell[][];

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
			let above_row = null;
			let cur_row = this.board[0];
			let below_row = this.board[1];
			for (let i = 0; i < cur_row.length; ++i) {
				cur_row[i].bl = below_row[i];
			}
			for (let i = 0; i < cur_row.length; ++i) {
				cur_row[i].br = below_row[i + 1];
			}
		}
		{
			let above_row = this.board[0];
			let cur_row = this.board[1];
			let below_row = this.board[2];
			for (let i = 1; i < cur_row.length; ++i) {
				cur_row[i].tl = above_row[i - 1];
			}
			for (let i = 0; i < cur_row.length - 1; ++i) {
				cur_row[i].tr = above_row[i];
			}
			for (let i = 0; i < cur_row.length; ++i) {
				cur_row[i].bl = below_row[i];
			}
			for (let i = 0; i < cur_row.length; ++i) {
				cur_row[i].br = below_row[i + 1];
			}
		}

		// testing purposes
		this.board[0][0].state = CellState.Black;
		this.board[8][4].state = CellState.White;
	}

	// this function does not work -> test it
	remove_any_other_selected_cells(cells_not_to: [number, number][]) {
		for (let i in this.board) {
			for (let j in this.board[i]) {
				if (!cells_not_to.some((cell) => cell[0] == parseInt(i) && cell[1] == parseInt(j)))
					this.board[i][j].is_selected = false;
			}
		}
		this.board = this.board;
	}
}
