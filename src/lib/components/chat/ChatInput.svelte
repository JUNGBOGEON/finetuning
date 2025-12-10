<script lang="ts">
	import SendIcon from '@lucide/svelte/icons/send';
	import SquareIcon from '@lucide/svelte/icons/square';
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import gemmaIcon from '$lib/assets/gemma3.png';
	import llamaIcon from '$lib/assets/llama.jpg';

	interface ModelOption {
		id: string;
		name: string;
		size: string;
		icon: string;
	}

	const models: ModelOption[] = [
		{ id: 'gemma3:4b', name: 'Gemma 3', size: '4B', icon: gemmaIcon },
		{ id: 'gemma3:12b', name: 'Gemma 3', size: '12B', icon: gemmaIcon },
		{ id: 'gemma3ft:12b', name: 'Gemma 3 (FT)', size: '12B', icon: gemmaIcon },
		{ id: 'llama3:8b', name: 'Llama 3', size: '8B', icon: llamaIcon },
		{ id: 'blossom3b-q8:latest', name: 'Llama 3 (FT 1)', size: '12B', icon: llamaIcon },
		{ id: 'llama3-ft2:12b', name: 'Llama 3 (FT 2)', size: '12B', icon: llamaIcon }
	];

	interface Props {
		value?: string;
		disabled?: boolean;
		placeholder?: string;
		centered?: boolean;
		selectedModel?: string;
		onsubmit?: () => void;
		onstop?: () => void;
		onmodelchange?: (model: string) => void;
	}

	let {
		value = $bindable(''),
		disabled = false,
		placeholder = '메시지를 입력하세요...',
		centered = false,
		selectedModel = $bindable('gemma3:4b'),
		onsubmit,
		onstop,
		onmodelchange
	}: Props = $props();

	const currentModel = $derived(models.find(m => m.id === selectedModel) || models[0]);

	let textareaEl: HTMLTextAreaElement;

	function selectModel(modelId: string) {
		selectedModel = modelId;
		onmodelchange?.(modelId);
	}

	function trimExcessiveLineBreaks(text: string): string {
		// Replace 3+ consecutive line breaks with 2
		return text.replace(/\n{3,}/g, '\n\n').trim();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			// Trim excessive line breaks before submit
			value = trimExcessiveLineBreaks(value);
			onsubmit?.();
		}
	}

	function handleInput() {
		if (!textareaEl) return;
		// Reset height to auto to get the correct scrollHeight
		textareaEl.style.height = 'auto';
		// Set new height based on content, with max limit
		const maxHeight = 200;
		const newHeight = Math.min(textareaEl.scrollHeight, maxHeight);
		textareaEl.style.height = `${newHeight}px`;
	}

	// Reset height when value is cleared
	$effect(() => {
		if (value === '' && textareaEl) {
			textareaEl.style.height = 'auto';
		}
	});
</script>

<!-- Notion-style input area -->
<div class={centered ? '' : 'border-t border-[var(--notion-border)] bg-[var(--notion-bg-primary)]'}>
	<div class={centered ? 'p-0' : 'max-w-3xl mx-auto p-4'}>
		<div class="rounded-lg border border-[var(--notion-border)] bg-[var(--notion-bg-secondary)] overflow-hidden focus-within:border-[var(--notion-blue)] transition-colors">
			<textarea
				bind:this={textareaEl}
				bind:value
				onkeydown={handleKeydown}
				oninput={handleInput}
				{disabled}
				{placeholder}
				rows={1}
				class="w-full min-h-[44px] max-h-[200px] resize-none border-0 bg-transparent px-3 py-3 text-sm text-[var(--notion-text-primary)] placeholder:text-[var(--notion-text-tertiary)] focus:outline-none overflow-y-auto"
			></textarea>
			<div class="flex items-center justify-between px-3 py-2 border-t border-[var(--notion-border)]">
				<!-- Model Selector -->
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<button
								{...props}
								type="button"
								class="flex items-center gap-2 px-2 py-1 rounded hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)] transition-colors"
							>
								<img src={currentModel.icon} alt={currentModel.name} class="size-4 rounded" />
								<span class="text-xs font-medium">{currentModel.name} ({currentModel.size})</span>
								<ChevronDownIcon class="size-3" />
							</button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="start" class="w-48">
						{#each models as model (model.id)}
							<DropdownMenu.Item
								onclick={() => selectModel(model.id)}
								class="flex items-center gap-2"
							>
								<img src={model.icon} alt={model.name} class="size-4 rounded" />
								<span>{model.name} ({model.size})</span>
								{#if model.id === selectedModel}
									<span class="ml-auto text-[var(--notion-blue)]">✓</span>
								{/if}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>

				{#if disabled}
					<button
						type="button"
						onclick={onstop}
						class="size-8 flex items-center justify-center rounded-full bg-[var(--notion-text-primary)] transition-colors"
					>
						<SquareIcon class="size-3 fill-[var(--notion-bg-primary)] text-[var(--notion-bg-primary)]" />
					</button>
				{:else}
					<button
						type="button"
						onclick={onsubmit}
						disabled={!value.trim()}
						class="size-8 flex items-center justify-center rounded-md bg-[var(--notion-blue)] text-white hover:bg-[var(--notion-blue)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
					>
						<SendIcon class="size-4" />
					</button>
				{/if}
			</div>
		</div>
		{#if !centered}
			<p class="text-center text-xs text-[var(--notion-text-tertiary)] mt-2">
				Enter로 전송 • Shift+Enter로 줄바꿈
			</p>
		{/if}
	</div>
</div>
