<script lang="ts">
	import type { UserWithAvatar, MenuItem } from '$lib/types';

	interface Props {
		user: UserWithAvatar;
		menuItems?: MenuItem[];
		activeMenuId?: string;
	}

	let { user, menuItems = [], activeMenuId = 'chat' }: Props = $props();

	const defaultMenuItems: MenuItem[] = [
		{ id: 'chat', label: '대화하기' },
		{ id: 'search', label: '검색' },
		{ id: 'settings', label: '설정' }
	];

	const items = menuItems.length > 0 ? menuItems : defaultMenuItems;
</script>

<aside class="sidebar">
	<div class="sidebar-header">
		<div class="user-item">
			<img class="user-avatar" src={user.avatarUrl} alt={user.username} />
			<span class="username">{user.global_name || user.username}</span>
		</div>
	</div>

	<nav class="sidebar-menu">
		{#each items as item}
			<div class="menu-item" class:active={item.id === activeMenuId}>
				<span class="icon">{item.icon || ''}</span>
				{item.label}
			</div>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<a href="/auth/logout" class="logout-btn">로그아웃</a>
	</div>
</aside>

<style>
	.sidebar {
		width: var(--sidebar-width);
		background-color: var(--bg-secondary);
		border-right: 1px solid var(--border-color);
		display: flex;
		flex-direction: column;
		padding: 12px;
	}

	.user-item {
		display: flex;
		align-items: center;
		padding: 8px;
		cursor: pointer;
		border-radius: var(--border-radius-sm);
	}

	.user-item:hover {
		background: rgba(255, 255, 255, 0.05);
	}

	.user-avatar {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		margin-right: 8px;
		object-fit: cover;
	}

	.username {
		font-size: 14px;
		color: var(--text-primary);
	}

	.sidebar-menu {
		margin-top: 16px;
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 6px 8px;
		color: var(--text-secondary);
		font-size: 14px;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		margin-bottom: 2px;
	}

	.menu-item:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-primary);
	}

	.menu-item.active {
		background: rgba(255, 255, 255, 0.08);
		color: var(--text-primary);
		font-weight: 500;
	}

	.menu-item .icon {
		margin-right: 8px;
		font-size: 16px;
	}

	.sidebar-footer {
		margin-top: auto;
		padding-top: 12px;
		border-top: 1px solid var(--border-color);
	}

	.logout-btn {
		display: block;
		padding: 8px 12px;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 13px;
		border-radius: var(--border-radius-sm);
		transition: all 0.2s;
	}

	.logout-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-primary);
	}
</style>
