import { win_animation } from '$lib/stores';
import type { Player } from '$lib/turn_state_machine';

export function show_win(player: Player) {
	win_animation.set({
		is_visible: true,
		player
	});

	// Automatically hide the notification after a certain time (e.g., 3 seconds)
	setTimeout(() => {
		win_animation.update((v) => {
			v.is_visible = false;
			return v;
		});
	}, 5000);
}
