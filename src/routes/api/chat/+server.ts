import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { model, messages } = await request.json();

        const response = await fetch('http://localhost:11434/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'gemma3:4b',
                messages,
                stream: true
            })
        });

        if (!response.ok) {
            const error = await response.text();
            return json({ error: `Ollama API error: ${error}` }, { status: response.status });
        }

        // Create a readable stream to forward chunks to the client
        const stream = new ReadableStream({
            async start(controller) {
                if (!response.body) {
                    controller.close();
                    return;
                }
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        // Forward the raw chunk to the client
                        // Ollama sends JSON objects one per line in stream mode
                        controller.enqueue(value);
                    }
                } catch (err) {
                    console.error('Stream reading error:', err);
                    controller.error(err);
                } finally {
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive'
            }
        });

    } catch (error) {
        console.error('Server logic error:', error);
        return json({ error: 'Internal Server Error' }, { status: 500 });
    }
};
