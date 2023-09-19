<script>
	import '../app.postcss';
	import { notification } from '$lib/stores';
	import { fly } from 'svelte/transition';
</script>

<nav class="my-8 flex justify-center text-lg">
	<a href="/" class="mx-8">Home</a>
	<a href="/how-to-play" class="mx-8">How to play</a>
	<a href="/typescript-local" class="mx-8">Typescript local</a>
	<a href="/typescript-online" class="mx-8">Typescript online</a>
	<!-- <a href="/rust-online" class="mx-8">Rust online</a> -->
</nav>
<slot />

{#if $notification.is_visible}
	<div
		transition:fly={{ y: 200, duration: 1000 }}
		class="fixed bottom-10 right-10 rounded-lg bg-red-700 p-4 text-white shadow-lg shadow-red-500"
	>
		<p>{$notification.message}</p>
	</div>
{/if}
