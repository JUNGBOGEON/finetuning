<script lang="ts">
	import MessageSquareIcon from '@lucide/svelte/icons/message-square';
	import SearchIcon from '@lucide/svelte/icons/search';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import type { UserWithAvatar } from '$lib/types';

	interface Props {
		user: UserWithAvatar;
	}

	let { user }: Props = $props();

	const menuItems = [
		{ id: 'chat', title: '대화하기', url: '/', icon: MessageSquareIcon },
		{ id: 'search', title: '검색', url: '#', icon: SearchIcon },
		{ id: 'settings', title: '설정', url: '#', icon: SettingsIcon }
	];
</script>

<Sidebar.Root>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="data-[state=open]:bg-sidebar-accent">
					<Avatar.Root class="size-8">
						<Avatar.Image src={user.avatarUrl} alt={user.username} />
						<Avatar.Fallback>{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
					</Avatar.Root>
					<div class="flex flex-col gap-0.5 leading-none">
						<span class="font-semibold">{user.global_name || user.username}</span>
						<span class="text-xs text-muted-foreground">내 워크스페이스</span>
					</div>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>메뉴</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each menuItems as item (item.id)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={item.id === 'chat'}>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon class="size-4" />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
							>
								<Avatar.Root class="size-6">
									<Avatar.Image src={user.avatarUrl} alt={user.username} />
									<Avatar.Fallback>{user.username.slice(0, 2).toUpperCase()}</Avatar.Fallback>
								</Avatar.Root>
								<span class="truncate">{user.global_name || user.username}</span>
								<ChevronUpIcon class="ml-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content side="top" class="w-[--bits-dropdown-menu-anchor-width]">
						<DropdownMenu.Item href="/auth/logout">
							<LogOutIcon class="mr-2 size-4" />
							<span>로그아웃</span>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
</Sidebar.Root>
