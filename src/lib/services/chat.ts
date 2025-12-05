import type { ChatMessage } from '$lib/types';

export interface SendMessageOptions {
	messages: ChatMessage[];
	model?: string;
	onChunk?: (content: string) => void;
	onComplete?: (fullContent: string) => void;
	onError?: (error: Error) => void;
}

export async function sendChatMessage(options: SendMessageOptions): Promise<void> {
	const {
		messages,
		model = 'gemma3:12b',
		onChunk,
		onComplete,
		onError
	} = options;

	try {
		const response = await fetch('/api/chat', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ messages, model })
		});

		if (!response.ok) {
			throw new Error(response.statusText);
		}

		if (!response.body) {
			throw new Error('No response body');
		}

		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		let fullContent = '';
		let buffer = '';
		let lastUpdate = 0;

		while (true) {
			const { done, value } = await reader.read();

			if (done) {
				if (buffer) {
					fullContent += buffer;
					onChunk?.(fullContent);
				}
				onComplete?.(fullContent);
				break;
			}

			const chunk = decoder.decode(value, { stream: true });
			const lines = chunk.split('\n');

			for (const line of lines) {
				if (!line.trim()) continue;
				try {
					const json = JSON.parse(line);
					if (json.message?.content) {
						buffer += json.message.content;
					}
				} catch {
					// Skip invalid JSON lines
				}
			}

			// Throttle updates to every 50ms
			const now = Date.now();
			if (now - lastUpdate > 50) {
				fullContent += buffer;
				buffer = '';
				onChunk?.(fullContent);
				lastUpdate = now;
			}
		}
	} catch (error) {
		onError?.(error instanceof Error ? error : new Error(String(error)));
	}
}
