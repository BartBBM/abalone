import { writable, type Writable } from 'svelte/store';

import { Game } from '$lib/index';
import { Player } from './turn_state_machine';

export const game = writable(new Game());

export interface Notification {
	is_visible: boolean;
	message: string;
}

export const notification: Writable<Notification> = writable({
	is_visible: false,
	message: ''
});

export interface WinAnimation {
	is_visible: boolean;
	player: Player;
}

export const win_animation: Writable<WinAnimation> = writable({
	is_visible: false,
	player: Player.White
});

export const chosen_player: Writable<Player | null> = writable(null); // also indicates wheter game is online or not
