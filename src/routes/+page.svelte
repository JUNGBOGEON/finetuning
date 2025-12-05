<script lang="ts">
	import { AppSidebar } from '$lib/components/layout';
	import {
		ChatHeader,
		ChatInput,
		MessageItem,
		ScrollToBottomButton
	} from '$lib/components/chat';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { createChatStore, createScrollStore } from '$lib/stores/chat.svelte';
	import { sendChatMessage } from '$lib/services/chat';
	import type { UserWithAvatar } from '$lib/types';

	interface PageData {
		user: UserWithAvatar;
	}

	let { data }: { data: PageData } = $props();

	// Stores
	const chatStore = createChatStore();
	const scrollStore = createScrollStore();

	// Local state
	let inputValue = $state('');
	let chatContainer: HTMLElement;

	// Scroll utilities
	function isNearBottom(): boolean {
		if (!chatContainer) return true;
		const threshold = 100;
		return (
			chatContainer.scrollHeight -
				chatContainer.scrollTop -
				chatContainer.clientHeight <
			threshold
		);
	}

	function handleScroll() {
		if (!chatContainer) return;

		const nearBottom = isNearBottom();

		if (!nearBottom && chatStore.isLoading) {
			scrollStore.disableAutoScroll();
		} else if (nearBottom) {
			scrollStore.enableAutoScroll();
		} else if (!chatStore.isLoading) {
			scrollStore.setShowButton(!nearBottom);
		}
	}

	function scrollToBottom() {
		if (!chatContainer) return;
		chatContainer.scrollTo({
			top: chatContainer.scrollHeight,
			behavior: 'smooth'
		});
		scrollStore.enableAutoScroll();
	}

	function autoScroll() {
		if (!chatContainer || !scrollStore.autoScrollEnabled || scrollStore.userScrolledUp) return;
		requestAnimationFrame(() => {
			chatContainer.scrollTo({
				top: chatContainer.scrollHeight,
				behavior: 'auto'
			});
		});
	}

	// Chat functionality
	async function sendMessage() {
		if (!inputValue.trim() || chatStore.isLoading) return;

		const userMessage = { role: 'user' as const, content: inputValue };
		chatStore.addMessage(userMessage);
		inputValue = '';
		chatStore.setLoading(true);
		scrollStore.reset();

		chatStore.addMessage({ role: 'assistant', content: '' });

		await sendChatMessage({
			messages: chatStore.messages.slice(0, -1),
			onChunk: (content) => {
				chatStore.updateLastMessage(content);
				autoScroll();
			},
			onComplete: () => {
				chatStore.setLoading(false);
			},
			onError: (error) => {
				console.error('Chat error:', error);
				chatStore.addMessage({
					role: 'system',
					content: 'Error: Failed to get response.'
				});
				chatStore.setLoading(false);
			}
		});
	}
</script>

<Sidebar.Provider>
	<AppSidebar user={data.user} />
	<Sidebar.Inset>
		<div class="flex flex-col h-screen">
			<ChatHeader />

			<div class="flex-1 relative overflow-hidden">
				<div
					class="absolute inset-0 overflow-y-auto"
					bind:this={chatContainer}
					onscroll={handleScroll}
				>
					<div class="py-6 space-y-6">
						{#if chatStore.messages.length === 0}
							<div class="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
								<p class="text-lg">무엇을 도와드릴까요?</p>
							</div>
						{/if}

						{#each chatStore.messages as message}
							<MessageItem {message} user={data.user} />
						{/each}
					</div>
				</div>

				<ScrollToBottomButton
					visible={scrollStore.showScrollButton}
					onclick={scrollToBottom}
				/>
			</div>

			<ChatInput
				bind:value={inputValue}
				disabled={chatStore.isLoading}
				onsubmit={sendMessage}
			/>
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
