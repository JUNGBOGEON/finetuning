<script lang="ts">
	import { marked } from 'marked';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import type { ChatMessage, UserWithAvatar } from '$lib/types';
	import { cn } from '$lib/utils.js';

	interface Props {
		message: ChatMessage;
		user: UserWithAvatar;
		aiName?: string;
	}

	let { message, user, aiName = 'Gemma' }: Props = $props();

	const isUser = $derived(message.role === 'user');
	const isAssistant = $derived(message.role === 'assistant');
	const isLoading = $derived(isAssistant && message.content === '');
	const displayName = $derived(isUser ? (user.global_name || user.username) : aiName);
</script>

<div
	class={cn(
		'flex gap-3 max-w-3xl mx-auto px-4 animate-in fade-in slide-in-from-bottom-2 duration-300',
		isUser && 'flex-row-reverse'
	)}
>
	<Avatar.Root class="size-8 shrink-0">
		{#if isUser}
			<Avatar.Image src={user.avatarUrl} alt={user.username} />
			<Avatar.Fallback>{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
		{:else}
			<Avatar.Fallback class="bg-primary text-primary-foreground text-xs">AI</Avatar.Fallback>
		{/if}
	</Avatar.Root>

	<div class={cn('flex flex-col gap-1 min-w-0', isUser && 'items-end')}>
		<span class="text-xs font-medium text-muted-foreground">{displayName}</span>
		<div
			class={cn(
				'rounded-lg px-4 py-3 text-sm leading-relaxed max-w-[85%]',
				isUser
					? 'bg-primary text-primary-foreground rounded-br-sm'
					: 'bg-muted text-foreground rounded-bl-sm'
			)}
		>
			{#if isLoading}
				<span class="text-muted-foreground italic animate-pulse">생각 중...</span>
			{:else if isAssistant}
				<div class="prose prose-sm dark:prose-invert max-w-none">
					{@html marked.parse(message.content)}
				</div>
			{:else}
				{message.content}
			{/if}
		</div>
	</div>
</div>
