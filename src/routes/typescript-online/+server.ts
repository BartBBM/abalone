import { Game } from '$lib';
import { new_game } from '$lib/db.js';
import { json } from '@sveltejs/kit';

export async function POST({ request, cookies }) {
	const uuid = crypto.randomUUID();

	let game = new Game();
	new_game(uuid, JSON.stringify(game.to_jsonable_object()));

	return json({ uuid }, { status: 201 });
}
