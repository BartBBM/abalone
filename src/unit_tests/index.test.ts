import { describe, it, expect } from 'vitest';
import { Game, Position } from '$lib/index';

// describe('sum test', () => {
// 	it('adds 1 + 2 to equal 3', () => {
// 		expect(1 + 2).toBe(3);
// 	});
// });

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
