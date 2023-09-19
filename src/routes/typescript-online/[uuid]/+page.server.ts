import { get_all_game_uuids_sorted, get_game_info } from '$lib/db';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	// console.log(get_game_info(params.uuid).then((v) => console.log(v)));
	return get_game_info(params.uuid);
};
