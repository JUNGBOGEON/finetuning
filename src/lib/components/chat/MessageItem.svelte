<script lang="ts">
	import { marked } from 'marked';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import CheckIcon from '@lucide/svelte/icons/check';
	import XIcon from '@lucide/svelte/icons/x';
	import type { ChatMessage, UserWithAvatar } from '$lib/types';
	import gemmaIcon from '$lib/assets/gemma3.png';
	import llamaIcon from '$lib/assets/llama.jpg';

	const modelInfo: Record<string, { name: string; icon: string }> = {
		'gemma3:4b': { name: 'Gemma 3 (4B)', icon: gemmaIcon },
		'gemma3:12b': { name: 'Gemma 3 (12B)', icon: gemmaIcon },
		'gemma3ft:12b': { name: 'Gemma 3 (FT) (12B)', icon: gemmaIcon },
		'llama3:8b': { name: 'Llama 3 (8B)', icon: llamaIcon },
		'solar-kor:latest': { name: 'Llama 3 (FT) (8B)', icon: llamaIcon }
	};

	interface Props {
		message: ChatMessage;
		user: UserWithAvatar;
		model?: string;
		index?: number;
		onedit?: (index: number, content: string) => void;
		ondelete?: (index: number) => void;
	}

	let { message, user, model = 'gemma3:4b', index = 0, onedit, ondelete }: Props = $props();

	let isEditing = $state(false);
	let editContent = $state('');

	const isUser = $derived(message.role === 'user');
	const isAssistant = $derived(message.role === 'assistant');
	const isLoading = $derived(isAssistant && message.content === '');
	const currentModelInfo = $derived(modelInfo[model] || modelInfo['gemma3:4b']);
	const displayName = $derived(isUser ? (user.global_name || user.username) : currentModelInfo.name);

	function startEdit() {
		editContent = message.content;
		isEditing = true;
	}

	function cancelEdit() {
		isEditing = false;
		editContent = '';
	}

	function saveEdit() {
		if (editContent.trim()) {
			onedit?.(index, editContent.trim());
		}
		isEditing = false;
	}

	function handleDelete() {
		ondelete?.(index);
	}
</script>

<!-- Notion-style message layout -->
<div class="group py-3">
	<div class="max-w-3xl mx-auto px-4 py-2 rounded-md flex gap-3 group-hover:bg-[var(--notion-bg-hover)] transition-colors">
		<!-- Avatar -->
		<div class="shrink-0 pt-0.5">
			{#if isUser}
				<Avatar.Root class="size-7 rounded">
					<Avatar.Image src={user.avatarUrl} alt={user.username} />
					<Avatar.Fallback class="text-[10px] bg-[var(--notion-blue)] text-white rounded">
						{user.username.slice(0, 2).toUpperCase()}
					</Avatar.Fallback>
				</Avatar.Root>
			{:else}
				<img src={currentModelInfo.icon} alt={currentModelInfo.name} class="size-7 rounded" />
			{/if}
		</div>

		<!-- Message content -->
		<div class="flex-1 min-w-0">
			<div class="flex items-center gap-2 mb-0.5">
				<span class="text-sm font-medium text-[var(--notion-text-primary)]">{displayName}</span>
				<span class="text-xs text-[var(--notion-text-tertiary)]">
					{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
				</span>

				<!-- Edit/Delete buttons (shown on hover) -->
				{#if !isLoading && !isEditing}
					<div class="opacity-0 group-hover:opacity-100 flex items-center gap-1 ml-auto transition-opacity">
						<button
							type="button"
							onclick={startEdit}
							class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-tertiary)] hover:text-[var(--notion-text-primary)] transition-colors"
							title="수정"
						>
							<PencilIcon class="size-3.5" />
						</button>
						<button
							type="button"
							onclick={handleDelete}
							class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-tertiary)] hover:text-red-500 transition-colors"
							title="삭제"
						>
							<TrashIcon class="size-3.5" />
						</button>
					</div>
				{/if}
			</div>

			<div class="text-sm text-[var(--notion-text-primary)] leading-relaxed">
				{#if isLoading}
					<span class="text-[var(--notion-text-secondary)] italic animate-pulse">생각 중..</span>
				{:else if isEditing}
					<div class="flex flex-col gap-2">
						<textarea
							bind:value={editContent}
							class="w-full min-h-[80px] p-2 rounded border border-[var(--notion-border)] bg-[var(--notion-bg-secondary)] text-sm resize-none focus:outline-none focus:border-[var(--notion-blue)]"
						></textarea>
						<div class="flex gap-2">
							<button
								type="button"
								onclick={saveEdit}
								class="px-3 py-1 text-xs rounded bg-[var(--notion-blue)] text-white hover:opacity-90 flex items-center gap-1"
							>
								<CheckIcon class="size-3" />
								저장
							</button>
							<button
								type="button"
								onclick={cancelEdit}
								class="px-3 py-1 text-xs rounded bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-secondary)] hover:bg-[var(--notion-bg-hover)] flex items-center gap-1"
							>
								<XIcon class="size-3" />
								취소
							</button>
						</div>
					</div>
				{:else if isAssistant}
					<div class="prose max-w-none">
						{@html marked.parse(message.content)}
					</div>
				{:else}
					<p class="whitespace-pre-wrap">{message.content}</p>
				{/if}
			</div>
		</div>
	</div>
</div>
