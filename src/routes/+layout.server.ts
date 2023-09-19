import { CLIENT_UUID } from '$lib/utils/cookies';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	if (!cookies.get(CLIENT_UUID)) cookies.set(CLIENT_UUID, crypto.randomUUID());
};
