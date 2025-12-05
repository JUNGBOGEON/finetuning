// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface DiscordUser {
	id: string;
	username: string;
	discriminator: string;
	avatar: string | null;
	global_name: string | null;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: DiscordUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
