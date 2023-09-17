// JUST FOR TESTING

import { to_sse_string } from '$lib/server/server-sent-event-streams';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = (request_event) => {
	const request = request_event.request;

	let controller_global: ReadableStreamDefaultController<any>;
	let intervalId: NodeJS.Timeout;
	const stream = new ReadableStream({
		start(controller) {
			controller_global = controller;
			intervalId = setInterval(() => {
				controller.enqueue(`data: ${new Date().toLocaleTimeString()}\n\n`);
			}, 1000);
		},
		cancel() {
			// This will be called if the client closes the connection
			clearInterval(intervalId);
		}
	});

	controller_global!.enqueue(to_sse_string('####################################'));

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
};
