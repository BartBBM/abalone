<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<h1 class="my-8 text-center text-2xl font-bold">Online with Typescript Backend</h1>
<section class="my-8 flex justify-center">
	<button
		class="inline-block rounded-lg bg-gradient-to-tr from-pink-600 to-fuchsia-600 px-8 py-4 text-lg font-semibold tracking-wider shadow-xl hover:bg-fuchsia-500"
		on:click={async () => {
			const response = await fetch('', { method: 'POST' });
			console.log(response);
			const { uuid } = await response.json();
			console.log(uuid);
			goto($page.url.pathname + '/' + uuid);
		}}
	>
		Start new Game
	</button>
	<!-- TODO also try on:click without async -->
</section>
<section class="flex flex-col items-center">
	<h2 class="my-2 text-lg font-semibold">Join existing games:</h2>
	<ol class="flex flex-col items-center">
		{#each data.games as uuid}
			<li
				class="my-1 font-semibold text-fuchsia-700 hover:text-fuchsia-800 hover:underline hover:underline-offset-1"
			>
				<a href="/typescript-online/{uuid}">{uuid}</a>
			</li>
		{/each}
	</ol>
</section>
