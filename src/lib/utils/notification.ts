import { notification } from '$lib/stores';

export function show_notification(message: string) {
	notification.set({
		is_visible: true,
		message
	});

	// Automatically hide the notification after a certain time (e.g., 3 seconds)
	setTimeout(() => {
		notification.update((v) => {
			v.is_visible = false;
			return v;
		});
	}, 3000);
}
