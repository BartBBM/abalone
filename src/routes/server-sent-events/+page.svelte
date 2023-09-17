<!-- JUST FOR TESTING -->

<script lang="ts">
	import { onMount } from 'svelte';

	let eventSource: any;
	let message = '';

	onMount(() => {
		eventSource = new EventSource('/date-event');

		eventSource.onmessage = (event: any) => {
			message = event.data;
		};

		return () => {
			eventSource.close();
		};
	});
</script>

<h1>Server send events</h1>
<p>Server time: {message}</p>
