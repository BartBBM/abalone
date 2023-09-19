import { get_all_game_uuids_sorted } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		games: get_all_game_uuids_sorted()
	};
};
