<script lang="ts">
	import { Cell, CellState } from '$lib';
	import Cell_Component from '$lib/Cell.svelte';

	let ins: Cell[] = [];
	ins.push(new Cell());
	ins[0].state = CellState.White;
	// ins.push(new Cell());
	// ins[1].state = CellState.White;

	let outs: Cell[] = [];

	function change() {
		let tmp = ins.pop();
		outs.push(tmp!);
		console.log(tmp);
		console.log(ins);
		console.log(outs);
		outs = outs;
		ins = ins;
	}
</script>

<div class="flex justify-center">
	{#each ins as cell, index}
		<Cell_Component cell_state={cell.state} row={1} col={1} key_for_animation={1} />
	{/each}
</div>

<div class="mt-8 text-center">Cells which have been kicked out:</div>
<div class=" flex justify-center">
	{#each outs as cell, index}
		<Cell_Component cell_state={cell.state} {index} row={-1} col={-1} key_for_animation={1} />
	{/each}
</div>

<button on:click={change}>Press</button>

<!-- <script lang="ts">
	import Cell_Component from '$lib/Cell.svelte';
	import { quintOut } from 'svelte/easing';
	import { crossfade } from 'svelte/transition';

	interface Fun {
		msg: string;
		id: number;
	}

	let ins: Fun[] = [];
	ins.push({ msg: 'hello', id: 1 });
	// ins.push(new Cell());
	// ins[1].state = CellState.White;

	let outs: Fun[] = [];

	function change() {
		let tmp = ins.pop();
		outs.push(tmp!);
		console.log(tmp);
		console.log(ins);
		console.log(outs);
		outs = outs;
		ins = ins;
	}

	const [send, receive] = crossfade({
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
</script>

<div class="flex justify-center">
	{#each ins as v, index}
		<div class="h-16 w-16 bg-red-800" in:receive={{ key: v.id }} out:send={{ key: v.id }}>
			{v.msg}
		</div>
	{/each}
</div>

<div class="mt-8 text-center">Cells which have been kicked out:</div>
<div class="flex justify-center">
	{#each outs as v, index}
		<div class="h-16 w-16 bg-red-800" in:receive={{ key: v.id }} out:send={{ key: v.id }}>
			{v.msg}
		</div>
	{/each}
</div>

<button on:click={change}>Press</button> -->
