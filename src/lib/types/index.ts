// User types
export interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	global_name: string | null;
}

export interface UserWithAvatar {
	id: number;
	discordId: string;
	username: string;
	global_name: string | null;
	email: string | null;
	avatarUrl: string | null;
}

// Chat types
export interface ChatMessage {
	id?: number;
	role: 'user' | 'assistant' | 'system';
	content: string;
	model?: string;
	createdAt?: Date;
}

export interface Conversation {
	id: number;
	userId: number;
	title: string | null;
	model: string | null;
	isFavorite: boolean;
	createdAt: Date;
	updatedAt: Date;
}

// Menu types
export interface MenuItem {
	id: string;
	label: string;
	icon?: string;
	active?: boolean;
}
