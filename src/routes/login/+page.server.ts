import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// If already logged in, redirect to main page
	if (locals.user) {
		redirect(302, '/');
	}

	return {};
};
