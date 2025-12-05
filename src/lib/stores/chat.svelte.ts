import type { ChatMessage } from '$lib/types';

export function createChatStore() {
	let messages = $state<ChatMessage[]>([]);
	let isLoading = $state(false);

	return {
		get messages() {
			return messages;
		},
		get isLoading() {
			return isLoading;
		},
		addMessage(message: ChatMessage) {
			messages = [...messages, message];
		},
		updateLastMessage(content: string) {
			if (messages.length > 0) {
				messages[messages.length - 1].content = content;
			}
		},
		setLoading(loading: boolean) {
			isLoading = loading;
		},
		clear() {
			messages = [];
			isLoading = false;
		}
	};
}

export function createScrollStore() {
	let autoScrollEnabled = $state(true);
	let showScrollButton = $state(false);
	let userScrolledUp = $state(false);

	return {
		get autoScrollEnabled() {
			return autoScrollEnabled;
		},
		get showScrollButton() {
			return showScrollButton;
		},
		get userScrolledUp() {
			return userScrolledUp;
		},
		enableAutoScroll() {
			autoScrollEnabled = true;
			userScrolledUp = false;
			showScrollButton = false;
		},
		disableAutoScroll() {
			autoScrollEnabled = false;
			userScrolledUp = true;
			showScrollButton = true;
		},
		setShowButton(show: boolean) {
			showScrollButton = show;
		},
		reset() {
			autoScrollEnabled = true;
			userScrolledUp = false;
			showScrollButton = false;
		}
	};
}
