<script lang="ts">
	export let href: string;
</script>

<a
	{href}
	class="text-fuchsia-600 underline underline-offset-2 hover:text-fuchsia-500 hover:drop-shadow-[2px_2px_1px_rgba(192,38,211,0.2)]"
>
	<slot />
</a>
