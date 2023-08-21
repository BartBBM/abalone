<script lang="ts">
	import { fade } from 'svelte/transition';
	import { Player } from './turn_state_machine';
	import { win_animation } from './stores';

	// from https://svelte.dev/tutorial/congratulations
	import { onMount } from 'svelte';

	let characters = ['🥳', '🎉', '✨'];

	let confetti = new Array(50)
		.fill({})
		.map((_, i) => {
			return {
				character: characters[i % characters.length],
				x: Math.random() * 90,
				y: -20 - Math.random() * 100,
				r: 0.1 + Math.random() * 1
			};
		})
		.sort((a, b) => a.r - b.r);

	onMount(() => {
		let frame: number;

		function loop() {
			frame = requestAnimationFrame(loop);

			confetti = confetti.map((emoji) => {
				emoji.y += 0.5 * emoji.r;
				if (emoji.y > 120) emoji.y = -20;
				return emoji;
			});
		}

		loop();

		return () => cancelAnimationFrame(frame);
	});
</script>

<div transition:fade class="fixed inset-0 z-50 flex items-center justify-center">
	<p
		class="rounded-full bg-white bg-opacity-95 p-8 text-5xl font-bold shadow-2xl shadow-black {$win_animation.player ==
		Player.White
			? 'text-fuchsia-700'
			: 'text-teal-700'}"
	>
		{$win_animation.player == Player.White ? 'White has won!!!' : 'Black has won!!!'}
	</p>
</div>

<div class="h-full w-full overflow-hidden">
	{#each confetti as c}
		<span
			transition:fade
			class="absolute select-none text-6xl"
			style="left: {c.x}%; top: {c.y}%; transform: scale({c.r})">{c.character}</span
		>
	{/each}
</div>

<style>
	:global(body) {
		overflow: hidden;
	}
</style>
