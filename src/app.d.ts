// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

interface AppUser {
	id: number;
	discordId: string;
	username: string;
	global_name: string | null;
	email: string | null;
	avatarUrl: string | null;
}

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: AppUser | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
