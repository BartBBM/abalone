export type SseStream = {
	game_uuid: string;
	client_uuid: string;
	sse_controller: ReadableStreamDefaultController<any>;
};

// key format: game_uuid|client_uuid
export let server_sent_event_streams: SseStream[] = [];

export function get_sse_stream(
	game_uuid: string,
	client_uuid: string
): ReadableStreamDefaultController<any> | undefined {
	let tmp = server_sent_event_streams.find(
		(v) => v.game_uuid === game_uuid && v.client_uuid === client_uuid
	);
	return tmp?.sse_controller;
}

export function send_sse_update_to_every_other_client_ingame(
	game_uuid: string,
	client_uuid: string,
	updated_json_game_info_for_client: string
) {
	let tmp = server_sent_event_streams.filter(
		// not client which gets queried for and every with the game_uuid
		(v) =>
			!(v.game_uuid === game_uuid && v.client_uuid === client_uuid) && v.game_uuid === game_uuid
	);
	tmp.map((v) => {
		v.sse_controller.enqueue(to_sse_string(updated_json_game_info_for_client));
	});
}

export function remove_sse_stream(game_uuid: string, client_uuid: string) {
	server_sent_event_streams = server_sent_event_streams.filter(
		(v) => !(v.game_uuid === game_uuid && v.client_uuid === client_uuid)
	);
}

export function to_sse_string(msg: string) {
	return `data: ${msg}\n\n`;
}
