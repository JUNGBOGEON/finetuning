<script lang="ts">
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';

	interface Props {
		visible?: boolean;
		onclick?: () => void;
	}

	let { visible = false, onclick }: Props = $props();
</script>

{#if visible}
	<div class="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-bottom-2 duration-200">
		<button
			type="button"
			{onclick}
			class="size-9 flex items-center justify-center rounded-full bg-[var(--notion-bg-secondary)] border border-[var(--notion-border)] shadow-lg hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)] transition-colors"
		>
			<ArrowDownIcon class="size-4" />
		</button>
	</div>
{/if}
