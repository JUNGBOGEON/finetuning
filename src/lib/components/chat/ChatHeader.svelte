<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import MoreHorizontalIcon from '@lucide/svelte/icons/more-horizontal';
	import StarIcon from '@lucide/svelte/icons/star';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	interface Props {
		title?: string;
		isFavorite?: boolean;
		hasConversation?: boolean;
		onToggleFavorite?: () => void;
		onDelete?: () => void;
	}

	let {
		title = '새 대화',
		isFavorite = false,
		hasConversation = false,
		onToggleFavorite,
		onDelete
	}: Props = $props();
</script>

<header class="flex h-11 shrink-0 items-center justify-between border-b border-[var(--notion-border)] px-3 bg-[var(--notion-bg-primary)]">
	<div class="flex items-center gap-2">
		<Sidebar.Trigger class="size-7 flex items-center justify-center rounded hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-secondary)]">
			<MenuIcon class="size-4" />
		</Sidebar.Trigger>
		<h1 class="text-sm font-medium text-[var(--notion-text-primary)]">{title}</h1>
	</div>
	{#if hasConversation}
		<div class="flex items-center gap-1">
			<button
				onclick={onToggleFavorite}
				class="size-7 flex items-center justify-center rounded hover:bg-[var(--notion-bg-hover)] {isFavorite ? 'text-yellow-500' : 'text-[var(--notion-text-tertiary)] hover:text-yellow-500'}"
				title={isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
			>
				<StarIcon class="size-4 {isFavorite ? 'fill-current' : ''}" />
			</button>
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<button
							{...props}
							class="size-7 flex items-center justify-center rounded hover:bg-[var(--notion-bg-hover)] text-[var(--notion-text-tertiary)]"
						>
							<MoreHorizontalIcon class="size-4" />
						</button>
					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end" class="w-48">
					<DropdownMenu.Item onclick={onDelete} class="text-red-500 cursor-pointer">
						<TrashIcon class="mr-2 size-4" />
						<span>대화 삭제</span>
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	{/if}
</header>
