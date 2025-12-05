<script lang="ts">
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		visible?: boolean;
		onclick?: () => void;
	}

	let { visible = false, onclick }: Props = $props();
</script>

{#if visible}
	<div class="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
		<Button
			variant="secondary"
			size="icon"
			class="rounded-full shadow-lg"
			{onclick}
		>
			<ArrowDownIcon class="size-4" />
		</Button>
	</div>
{/if}
