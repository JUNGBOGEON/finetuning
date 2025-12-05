<script lang="ts">
	import SendIcon from '@lucide/svelte/icons/send';
	import LoaderIcon from '@lucide/svelte/icons/loader';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Button } from '$lib/components/ui/button/index.js';

	interface Props {
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		footerText?: string;
		onsubmit?: () => void;
	}

	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '메시지를 입력하세요...',
		footerText = 'Running on localhost • gemma3:4b',
		onsubmit
	}: Props = $props();

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			onsubmit?.();
		}
	}
</script>

<div class="p-4 border-t border-border bg-gradient-to-t from-background to-transparent">
	<div class="max-w-3xl mx-auto">
		<div class="flex gap-2 items-end rounded-lg border border-border bg-card p-2 shadow-sm">
			<Textarea
				bind:value
				onkeydown={handleKeydown}
				{disabled}
				{placeholder}
				rows={1}
				class="min-h-[40px] max-h-[200px] resize-none border-0 bg-transparent p-2 focus-visible:ring-0 focus-visible:ring-offset-0"
			/>
			<Button
				size="icon"
				onclick={onsubmit}
				disabled={disabled || !value.trim()}
				class="shrink-0"
			>
				{#if disabled}
					<LoaderIcon class="size-4 animate-spin" />
				{:else}
					<SendIcon class="size-4" />
				{/if}
			</Button>
		</div>
		<p class="text-center text-xs text-muted-foreground mt-2">{footerText}</p>
	</div>
</div>
