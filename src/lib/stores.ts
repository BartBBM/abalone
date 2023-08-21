import { writable, type Writable } from 'svelte/store';

import { Game } from '$lib/index';

export const game = writable(new Game());

export interface Notification {
	is_visible: boolean;
	message: string;
}

export const notification: Writable<Notification> = writable({
	is_visible: false,
	message: ''
});
