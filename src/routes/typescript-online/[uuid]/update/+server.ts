import { CLIENT_UUID } from '$lib/cookies';
import {
	get_sse_stream,
	remove_sse_stream,
	server_sent_event_streams,
	to_sse_string
} from '$lib/server/server-sent-event-streams';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = (request_event) => {
	const split_url = request_event.request.url.split('/');
	split_url.pop();
	const game_uuid = split_url.pop();
	if (!game_uuid) throw Error('impl is wrong');

	const client_uuid = request_event.cookies.get(CLIENT_UUID);
	if (!client_uuid) throw Error('impl is wrong');
	console.log('Game uuid and client ##', game_uuid, client_uuid);

	let same_obj = {
		game_uuid,
		client_uuid
	};

	const stream = new ReadableStream({
		start(controller) {
			server_sent_event_streams.push({ game_uuid, client_uuid, sse_controller: controller });
		},
		cancel() {
			remove_sse_stream(game_uuid, client_uuid);
		}
	});

	// console.log(server_sent_event_streams);
	// console.log(get_sse_stream(game_uuid, client_uuid));

	// get_sse_stream(game_uuid, client_uuid)!.enqueue(
	// 	to_sse_string('###################asdfasdfasdf#################')
	// );

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
