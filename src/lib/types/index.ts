// User types
export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	global_name: string | null;
}

export interface UserWithAvatar extends DiscordUser {
	avatarUrl: string;
}

// Chat types
export interface ChatMessage {
	role: 'user' | 'assistant' | 'system';
	content: string;
}

// Menu types
export interface MenuItem {
	id: string;
	label: string;
	icon?: string;
	active?: boolean;
}
