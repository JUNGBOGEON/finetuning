import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getAvatarUrl } from '$lib/server/discord';

export const load: PageServerLoad = async ({ locals }) => {
	// Redirect to login if not authenticated
	if (!locals.user) {
		redirect(302, '/login');
	}

	return {
		user: {
			...locals.user,
			avatarUrl: getAvatarUrl(locals.user)
		}
	};
};
