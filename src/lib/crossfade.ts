import { quintOut } from 'svelte/easing';
import { crossfade as svelteCrossfade } from 'svelte/transition';

export const crossfade = svelteCrossfade({
	duration: (d) => Math.sqrt(d * 200),

	fallback(node, params) {
		const style = getComputedStyle(node);
		const transform = style.transform === 'none' ? '' : style.transform;

		return {
			duration: 6000,
			easing: quintOut,
			css: (t) => `
					transform: ${transform} scale(${t});
					opacity: ${t}
				`
		};
	}
});

// export const crossfade = svelteCrossfade({});