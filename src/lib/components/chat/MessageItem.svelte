<script lang="ts">
	import { marked } from 'marked';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import type { ChatMessage, UserWithAvatar } from '$lib/types';
	import gemmaIcon from '$lib/assets/gemma3.png';

	interface Props {
		message: ChatMessage;
		user: UserWithAvatar;
		modelName?: string;
	}

	let { message, user, modelName = 'Gemma 3 (4B)' }: Props = $props();

	const isUser = $derived(message.role === 'user');
	const isAssistant = $derived(message.role === 'assistant');
	const isLoading = $derived(isAssistant && message.content === '');
	const displayName = $derived(isUser ? (user.global_name || user.username) : modelName);
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
				<img src={gemmaIcon} alt="Gemma" class="size-7 rounded" />
			{/if}
		</div>

		<!-- Message content -->
		<div class="flex-1 min-w-0">
			<div class="flex items-baseline gap-2 mb-0.5">
				<span class="text-sm font-medium text-[var(--notion-text-primary)]">{displayName}</span>
				<span class="text-xs text-[var(--notion-text-tertiary)]">
					{new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
				</span>
			</div>

			<div class="text-sm text-[var(--notion-text-primary)] leading-relaxed">
				{#if isLoading}
					<span class="text-[var(--notion-text-secondary)] italic animate-pulse">생각 중..</span>
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
