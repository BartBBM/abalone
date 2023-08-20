import { describe, it, expect } from 'vitest';
import { Game } from '$lib/index';
import * as Index from '$lib/index';

// describe('finding out how stuff works', () => {
// 	it('how includes() works', () => {
// 		let cells_not_to: Position[] = [[0, 1]];
// 		expect(cells_not_to.includes([parseInt('0'), parseInt('0')])).toBe(false);
// 		expect(cells_not_to.includes(cells_not_to[0])).toBe(true);

// 		expect(cells_not_to.some((cell) => cell == [0, 1])).toBe(true);
// 		// console.log([parseInt('0'), parseInt('1')]);
// 		// expect(cells_not_to.includes([parseInt('0'), parseInt('1')])).toBe(true);
// 	});
// });

describe('Game - remove_any_other_selected_cells()', () => {
	it('checks if function works', () => {
		let game = new Game();
		let cells_not_to: [number, number][] = [[0, 1]];
		game.board[0][0].is_selected = true;
		game.board[0][1].is_selected = true;
		game.remove_any_other_selected_cells(cells_not_to);

		expect(game.board[0][0].is_selected).toBe(false);
		expect(game.board[0][1].is_selected).toBe(true);
		expect(game.board[0][2].is_selected).toBe(false);
	});
});

describe('Game - mark_selectable_cells()', () => {
	it('checks if stuff for function works', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = true));

		expect(game.board[0][0].is_selectable).toBe(true);
		expect(game.board[4][1].is_selectable).toBe(true);
		expect(game.board[2][2].is_selectable).toBe(true);
	});
});

describe('get_direction_of_possible_move()', () => {
	it('does a simple test - bl', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		let [dir, from_index] = Index.get_direction_of_possible_move(
			[game.board[0][0], game.board[1][0]],
			game.board[2][0]
		);

		expect(dir).toBe(Index.Direction.bl);
		expect(from_index).toBe(1);
	});

	it('inverse - right', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		let [dir, from_index] = Index.get_direction_of_possible_move(
			[game.board[0][1], game.board[0][0]],
			game.board[0][2]
		);

		expect(dir).toBe(Index.Direction.right);
		expect(from_index).toBe(0);
	});
});

describe('is_sumito_possible()', () => {
	it('2-1 sumito', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		game.board[4][0].state = Index.CellState.Black;
		game.board[4][1].state = Index.CellState.White;
		game.board[4][2].state = Index.CellState.White;

		let span = [game.board[4][2], game.board[4][1]];
		let to = game.board[4][0];

		let res = Index.is_sumito_possible(span, to, Index.get_direction_of_possible_move(span, to)[0]);

		expect(res).toBe(true);
	});

	it('2-2 sumito', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		game.board[4][0].state = Index.CellState.Black;
		game.board[4][1].state = Index.CellState.Black;
		game.board[4][2].state = Index.CellState.White;
		game.board[4][3].state = Index.CellState.White;

		let span = [game.board[4][3], game.board[4][2]];
		let to = game.board[4][1];

		let res = Index.is_sumito_possible(span, to, Index.get_direction_of_possible_move(span, to)[0]);

		expect(res).toBe(false);
	});

	it('2-3 sumito', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		game.board[4][0].state = Index.CellState.Black;
		game.board[4][1].state = Index.CellState.Black;
		game.board[4][2].state = Index.CellState.Black;
		game.board[4][3].state = Index.CellState.White;
		game.board[4][4].state = Index.CellState.White;

		let span = [game.board[4][3], game.board[4][4]];
		let to = game.board[4][2];

		let res = Index.is_sumito_possible(span, to, Index.get_direction_of_possible_move(span, to)[0]);

		expect(res).toBe(false);
	});

	it('3-2 sumito', () => {
		let game = new Game();
		game.board.flat().forEach((value) => (value.is_selectable = false));

		game.board[4][0].state = Index.CellState.Black;
		game.board[4][1].state = Index.CellState.Black;
		game.board[4][2].state = Index.CellState.White;
		game.board[4][3].state = Index.CellState.White;
		game.board[4][4].state = Index.CellState.White;

		let span = [game.board[4][2], game.board[4][3], game.board[4][4]];
		let to = game.board[4][1];

		let res = Index.is_sumito_possible(span, to, Index.get_direction_of_possible_move(span, to)[0]);

		expect(res).toBe(true);
	});
});
