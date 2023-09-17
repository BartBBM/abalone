import { get_all_games } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		games: get_all_games()
	};
};
