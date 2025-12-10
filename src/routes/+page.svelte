<script lang="ts">
	import { AppSidebar } from '$lib/components/layout';
	import {
		ChatHeader,
		ChatInput,
		MessageItem,
		ScrollToBottomButton
	} from '$lib/components/chat';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { createChatStore, createScrollStore } from '$lib/stores/chat.svelte';
	import { sendChatMessage } from '$lib/services/chat';
	import type { UserWithAvatar, Conversation } from '$lib/types';

	interface PageData {
		user: UserWithAvatar;
		conversations: Conversation[];
	}

	let { data }: { data: PageData } = $props();

	// Stores
	const chatStore = createChatStore();
	const scrollStore = createScrollStore();

	// Local state
	let inputValue = $state('');
	let selectedModel = $state('gemma3:4b');
	let currentConversationId = $state<number | null>(null);
	let conversations = $state<Conversation[]>(data.conversations || []);
	let chatContainer: HTMLElement;
	let abortController: AbortController | null = null;
	const currentConversation = $derived(conversations.find(c => c.id === currentConversationId));
	const currentConversationTitle = $derived(currentConversation?.title || '새 대화');
	const currentConversationIsFavorite = $derived(currentConversation?.isFavorite || false);

	// Delete dialog state
	let deleteDialogOpen = $state(false);
	let deleteTargetId = $state<number | null>(null);

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

	// Create new conversation
	async function createNewConversation(): Promise<number> {
		const response = await fetch('/api/conversations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ model: selectedModel })
		});
		const conversation = await response.json();
		conversations = [conversation, ...conversations];
		return conversation.id;
	}

	// Save message to database
	async function saveMessage(conversationId: number, role: string, content: string, model?: string) {
		await fetch(`/api/conversations/${conversationId}/messages`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role, content, model })
		});
	}

	// Load conversation
	async function loadConversation(conversationId: number) {
		const response = await fetch(`/api/conversations/${conversationId}`);
		const data = await response.json();

		currentConversationId = conversationId;
		chatStore.clearMessages();

		for (const msg of data.messages) {
			chatStore.addMessage({
				id: msg.id,
				role: msg.role,
				content: msg.content,
				model: msg.model,
				createdAt: msg.createdAt
			});
		}

		if (data.conversation.model) {
			selectedModel = data.conversation.model;
		}
	}

	// Start new chat
	function startNewChat() {
		currentConversationId = null;
		chatStore.clearMessages();
		scrollStore.reset();
	}

	// Open delete dialog
	function openDeleteDialog(conversationId: number) {
		deleteTargetId = conversationId;
		deleteDialogOpen = true;
	}

	// Confirm delete conversation
	async function confirmDeleteConversation() {
		if (!deleteTargetId) return;

		try {
			await fetch(`/api/conversations/${deleteTargetId}`, {
				method: 'DELETE'
			});

			// Remove from local state
			conversations = conversations.filter(c => c.id !== deleteTargetId);

			// If deleted conversation was current, start new chat
			if (currentConversationId === deleteTargetId) {
				startNewChat();
			}
		} catch (error) {
			console.error('Failed to delete conversation:', error);
		} finally {
			deleteDialogOpen = false;
			deleteTargetId = null;
		}
	}

	// Toggle favorite
	async function toggleFavorite(conversationId: number, isFavorite: boolean) {
		try {
			const response = await fetch(`/api/conversations/${conversationId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isFavorite })
			});

			if (response.ok) {
				// Update local state
				conversations = conversations.map(c =>
					c.id === conversationId ? { ...c, isFavorite } : c
				);
			}
		} catch (error) {
			console.error('Failed to toggle favorite:', error);
		}
	}

	// Chat functionality
	async function sendMessage() {
		if (!inputValue.trim() || chatStore.isLoading) return;

		const userContent = inputValue;
		const userMessage = { role: 'user' as const, content: userContent };
		chatStore.addMessage(userMessage);
		inputValue = '';
		chatStore.setLoading(true);
		scrollStore.reset();

		// Create conversation if needed
		if (!currentConversationId) {
			currentConversationId = await createNewConversation();
		}

		// Save user message to database
		await saveMessage(currentConversationId, 'user', userContent, selectedModel);

		chatStore.addMessage({ role: 'assistant', content: '' });

		let assistantContent = '';
		abortController = new AbortController();

		await sendChatMessage({
			messages: chatStore.messages.slice(0, -1),
			model: selectedModel,
			signal: abortController.signal,
			onChunk: (content) => {
				assistantContent = content;
				chatStore.updateLastMessage(content);
				autoScroll();
			},
			onComplete: async () => {
				// Save assistant message to database
				if (currentConversationId && assistantContent) {
					await saveMessage(currentConversationId, 'assistant', assistantContent, selectedModel);
				}
				chatStore.setLoading(false);
				abortController = null;

				// Refresh conversations list
				const response = await fetch('/api/conversations');
				conversations = await response.json();
			},
			onError: (error) => {
				console.error('Chat error:', error);
				chatStore.addMessage({
					role: 'system',
					content: 'Error: Failed to get response.'
				});
				chatStore.setLoading(false);
				abortController = null;
			}
		});
	}

	async function stopGeneration() {
		if (abortController) {
			abortController.abort();
			abortController = null;

			// Save current content if any
			const lastMessage = chatStore.messages[chatStore.messages.length - 1];
			if (currentConversationId && lastMessage?.role === 'assistant' && lastMessage.content) {
				await saveMessage(currentConversationId, 'assistant', lastMessage.content, selectedModel);
			}

			chatStore.setLoading(false);

			// Refresh conversations list
			const response = await fetch('/api/conversations');
			conversations = await response.json();
		}
	}

	async function editMessage(index: number, content: string) {
		const message = chatStore.messages[index];
		if (!message) return;

		// Update local state immediately
		chatStore.updateMessage(index, content);

		// Update in database if message has an ID
		if (message.id) {
			try {
				await fetch(`/api/messages/${message.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ content })
				});
			} catch (error) {
				console.error('Failed to update message:', error);
			}
		}
	}

	async function deleteMessage(index: number) {
		const message = chatStore.messages[index];
		if (!message) return;

		// Delete from database if message has an ID
		if (message.id) {
			try {
				await fetch(`/api/messages/${message.id}`, {
					method: 'DELETE'
				});
			} catch (error) {
				console.error('Failed to delete message:', error);
			}
		}

		// Update local state
		chatStore.deleteMessage(index);
	}
</script>

<Sidebar.Provider>
	<AppSidebar
		user={data.user}
		{conversations}
		{currentConversationId}
		onNewChat={startNewChat}
		onSelectConversation={loadConversation}
		onDeleteConversation={openDeleteDialog}
		onToggleFavorite={toggleFavorite}
	/>
	<Sidebar.Inset>
		<div class="flex flex-col h-screen">
			<ChatHeader
				title={currentConversationTitle}
				isFavorite={currentConversationIsFavorite}
				hasConversation={currentConversationId !== null}
				onToggleFavorite={() => currentConversationId && toggleFavorite(currentConversationId, !currentConversationIsFavorite)}
				onDelete={() => currentConversationId && openDeleteDialog(currentConversationId)}
			/>

			{#if chatStore.messages.length === 0}
				<!-- Empty state: centered input -->
				<div class="flex-1 flex flex-col items-center justify-center px-4">
					<h2 class="text-xl font-semibold text-[var(--notion-text-primary)] mb-6">무엇을 도와드릴까요?</h2>
					<div class="w-full max-w-2xl">
						<ChatInput
							bind:value={inputValue}
							bind:selectedModel={selectedModel}
							disabled={chatStore.isLoading}
							onsubmit={sendMessage}
							onstop={stopGeneration}
							centered={true}
						/>
					</div>
				</div>
			{:else}
				<!-- Chat mode: messages with input at bottom -->
				<div class="flex-1 relative overflow-hidden">
					<div
						class="absolute inset-0 overflow-y-auto"
						bind:this={chatContainer}
						onscroll={handleScroll}
					>
						<div class="py-4">
							{#each chatStore.messages as message, index}
								<MessageItem
									{message}
									user={data.user}
									model={selectedModel}
									{index}
									onedit={editMessage}
									ondelete={deleteMessage}
								/>
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
					bind:selectedModel={selectedModel}
					disabled={chatStore.isLoading}
					onsubmit={sendMessage}
					onstop={stopGeneration}
				/>
			{/if}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<!-- Delete Confirmation Dialog -->
<AlertDialog.Root bind:open={deleteDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>대화를 삭제하시겠습니까?</AlertDialog.Title>
			<AlertDialog.Description>
				이 작업은 되돌릴 수 없습니다. 대화와 모든 메시지가 영구적으로 삭제됩니다.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>취소</AlertDialog.Cancel>
			<AlertDialog.Action onclick={confirmDeleteConversation} class="bg-red-600 hover:bg-red-700">
				삭제
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
