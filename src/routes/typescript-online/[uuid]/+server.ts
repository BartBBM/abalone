import { Game } from '$lib';
import { CLIENT_UUID } from '$lib/utils/cookies';
import { get_game_info, update_game } from '$lib/db.js';
import {
	get_sse_stream,
	send_sse_update_to_every_other_client_ingame,
	to_sse_string
} from '$lib/server/server-sent-event-streams';
import type { GridPosition } from '$lib/utils/position.js';
import { fail, json } from '@sveltejs/kit';

export async function POST({ request, cookies, route }) {
	const client_uuid = cookies.get(CLIENT_UUID);
	if (!client_uuid) throw Error('impl is wrong');
	const game_uuid = request.url.split('/').pop();
	console.log(`POST for game: ${game_uuid}`);
	if (game_uuid == undefined)
		// return fail(400, { description: 'uuid_not_parsable: true', error: 'undefined' });
		throw Error('uuid not parsable');

	const request_body = await request.json();
	const position: GridPosition = request_body.position;
	// console.log('##', position);

	const json_game_info = await get_game_info(game_uuid);
	// console.log(json_game_info);

	if (!json_game_info) throw Error('Game not found');
	const game = new Game();
	game.update_from_json(json_game_info);
	game.action(position.row, position.col);

	// reorder_board() gets called by server and by client individually
	const updated_json_game_info_for_client = JSON.stringify(game.to_jsonable_object());

	game.reorder_board();
	await update_game(game_uuid, JSON.stringify(game.to_jsonable_object())); // does not have to be awaited

	send_sse_update_to_every_other_client_ingame(
		game_uuid,
		client_uuid,
		updated_json_game_info_for_client
	);

	return json({ updated_json_game_info: updated_json_game_info_for_client }, { status: 201 });
}
