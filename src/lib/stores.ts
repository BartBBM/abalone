import { writable } from 'svelte/store';

import { Game } from '$lib/index';

export const game = writable(new Game());
