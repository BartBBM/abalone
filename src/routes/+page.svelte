<script lang="ts">
	import Link from '$lib/Link.svelte';
</script>

<section class="mx-auto max-w-prose text-lg">
	<h1 class="mb-4 text-center text-2xl font-medium text-fuchsia-600">Abalone</h1>
	<p>
		This is a project created by me - Meo - to try out creating a web app and getting my hands
		dirty. This project uses
		<a
			class="text-orange-600 underline underline-offset-2 hover:text-orange-500 hover:drop-shadow-[2px_2px_1px_rgba(234,88,12,0.2)]"
			href="https://svelte.dev/"
			target="_blank"
			rel="noopener noreferrer">Svelte</a
		>
		with
		<a
			class="text-sky-500 underline underline-offset-2 hover:text-sky-400 hover:drop-shadow-[2px_2px_1px_rgba(14,165,233,0.2)]"
			href="https://tailwindcss.com/"
			target="_blank"
			rel="noopener noreferrer">Tailwind CSS</a
		>
		to create a visual representation while the logic is programmed in various ways.
	</p>
	<p class="my-4">
		For the <Link href="typescript-local">simplest version</Link> the state is kept in the browser, all
		being programmed in
		<a
			class="text-blue-500 underline underline-offset-2 hover:text-blue-400 hover:drop-shadow-[2px_2px_1px_rgba(59,130,246,0.2)]"
			href="https://www.typescriptlang.org/"
			target="_blank"
			rel="noopener noreferrer">TypeScript</a
		>. This version allows you to play Abalone locally without the need for a constant internet
		connection.
	</p>
	<p class="my-4">
		To play together with your friends, use <Link href="typescript-online">Typescript online</Link>
		where the state is kept on the server in a simple sqlite database.
	</p>
	<p class="my-4">This project is hostet with Cloud Run from Google Cloud.</p>
</section>
