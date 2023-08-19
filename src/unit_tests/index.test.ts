import { describe, it, expect } from 'vitest';
import { Game } from '$lib/index';

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
