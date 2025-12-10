<script lang="ts">
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import StarIcon from '@lucide/svelte/icons/star';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { UserWithAvatar, Conversation } from '$lib/types';

	interface Props {
		user: UserWithAvatar;
		conversations?: Conversation[];
		currentConversationId?: number | null;
		onNewChat?: () => void;
		onSelectConversation?: (id: number) => void;
		onDeleteConversation?: (id: number) => void;
		onToggleFavorite?: (id: number, isFavorite: boolean) => void;
	}

	let {
		user,
		conversations = [],
		currentConversationId = null,
		onNewChat,
		onSelectConversation,
		onDeleteConversation,
		onToggleFavorite
	}: Props = $props();

	// Separate favorites and regular conversations
	const favoriteConversations = $derived(conversations.filter(c => c.isFavorite));
	const regularConversations = $derived(conversations.filter(c => !c.isFavorite));

	function formatDate(date: Date): string {
		const d = new Date(date);
		const now = new Date();
		const diff = now.getTime() - d.getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return '오늘';
		if (days === 1) return '어제';
		if (days < 7) return `${days}일 전`;
		return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
	}
</script>

<Sidebar.Root class="border-r-0">
	<!-- Notion-style workspace header -->
	<Sidebar.Header class="p-3">
		<DropdownMenu.Root>
			<DropdownMenu.Trigger class="w-full">
				{#snippet child({ props })}
					<button
						{...props}
						class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-[var(--notion-bg-hover)] transition-colors"
					>
						<Avatar.Root class="size-5 rounded">
							<Avatar.Image src={user.avatarUrl} alt={user.username} />
							<Avatar.Fallback class="text-[10px] rounded">{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
						</Avatar.Root>
						<span class="flex-1 truncate font-medium text-[var(--notion-text-primary)]">
							{user.global_name || user.username}의 워크스페이스
						</span>
						<ChevronsUpDownIcon class="size-4 text-[var(--notion-text-tertiary)]" />
					</button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="start" class="w-72">
				<div class="px-2 py-1.5 text-xs text-[var(--notion-text-tertiary)]">
					{user.email || user.username}
				</div>
				<DropdownMenu.Separator />
				<DropdownMenu.Item onclick={() => window.location.href = '/auth/logout'} class="text-[var(--destructive)] cursor-pointer">
					<LogOutIcon class="mr-2 size-4" />
					<span>로그아웃</span>
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.Header>

	<Sidebar.Content class="px-2">
		<!-- New Chat Button - Notion Style -->
		<div class="mb-4">
			<button
				onclick={onNewChat}
				class="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-[var(--notion-text-secondary)] hover:bg-[var(--notion-bg-hover)] transition-colors"
			>
				<PlusIcon class="size-4" />
				<span>새 대화</span>
			</button>
		</div>

		<!-- Favorite Conversations -->
		{#if favoriteConversations.length > 0}
			<Sidebar.Group>
				<Sidebar.GroupLabel class="px-2 text-xs font-medium text-[var(--notion-text-tertiary)] uppercase tracking-wider">
					즐겨찾기
				</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<div class="space-y-1">
						{#each favoriteConversations as conversation (conversation.id)}
							<div class="group flex items-center rounded-md transition-colors {currentConversationId === conversation.id ? 'bg-[var(--notion-bg-hover)]' : 'hover:bg-[var(--notion-bg-hover)]'}">
								<button
									onclick={() => onSelectConversation?.(conversation.id)}
									class="flex flex-1 min-w-0 items-center gap-2 px-2 py-2 text-left text-sm {currentConversationId === conversation.id ? 'text-[var(--notion-text-primary)]' : 'text-[var(--notion-text-secondary)]'}"
								>
									<MessageSquareIcon class="size-4 shrink-0" />
									<span class="truncate">{conversation.title || '새 대화'}</span>
								</button>
								<div class="flex items-center shrink-0 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(conversation.id, false); }}
										class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-yellow-500"
										title="즐겨찾기 해제"
									>
										<StarIcon class="size-4 fill-current" />
									</button>
									<button
										onclick={(e) => { e.stopPropagation(); onDeleteConversation?.(conversation.id); }}
										class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-tertiary)] hover:text-red-500"
										title="삭제"
									>
										<TrashIcon class="size-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}

		<!-- Regular Conversation History -->
		{#if regularConversations.length > 0}
			<Sidebar.Group>
				<Sidebar.GroupLabel class="px-2 text-xs font-medium text-[var(--notion-text-tertiary)] uppercase tracking-wider">
					대화 기록
				</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<div class="space-y-1">
						{#each regularConversations as conversation (conversation.id)}
							<div class="group flex items-center rounded-md transition-colors {currentConversationId === conversation.id ? 'bg-[var(--notion-bg-hover)]' : 'hover:bg-[var(--notion-bg-hover)]'}">
								<button
									onclick={() => onSelectConversation?.(conversation.id)}
									class="flex flex-1 min-w-0 items-center gap-2 px-2 py-2 text-left text-sm {currentConversationId === conversation.id ? 'text-[var(--notion-text-primary)]' : 'text-[var(--notion-text-secondary)]'}"
								>
									<MessageSquareIcon class="size-4 shrink-0" />
									<span class="truncate">{conversation.title || '새 대화'}</span>
								</button>
								<div class="flex items-center shrink-0 pr-1 opacity-0 group-hover:opacity-100 transition-opacity">
									<button
										onclick={(e) => { e.stopPropagation(); onToggleFavorite?.(conversation.id, true); }}
										class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-tertiary)] hover:text-yellow-500"
										title="즐겨찾기"
									>
										<StarIcon class="size-4" />
									</button>
									<button
										onclick={(e) => { e.stopPropagation(); onDeleteConversation?.(conversation.id); }}
										class="p-1 rounded hover:bg-[var(--notion-bg-tertiary)] text-[var(--notion-text-tertiary)] hover:text-red-500"
										title="삭제"
									>
										<TrashIcon class="size-4" />
									</button>
								</div>
							</div>
						{/each}
					</div>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{:else if favoriteConversations.length === 0}
			<div class="px-2 py-4 text-center text-sm text-[var(--notion-text-tertiary)]">
				대화 기록이 없습니다
			</div>
		{/if}
	</Sidebar.Content>
</Sidebar.Root>
