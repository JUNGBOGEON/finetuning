<script lang="ts">
    import { marked } from "marked";
    let messages = $state<{ role: string; content: string }[]>([]);
    let inputValue = $state("");
    let isLoading = $state(false);
    let chatContainer: HTMLElement;

    async function sendMessage() {
        if (!inputValue.trim() || isLoading) return;

        const userMessage = { role: "user", content: inputValue };
        messages = [...messages, userMessage];
        inputValue = "";
        isLoading = true;

        // Add placeholder for AI response
        messages = [...messages, { role: "assistant", content: "" }];

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: messages.slice(0, -1), // Send history excluding empty placeholder
                    model: "gemma3:12b",
                }),
            });

            if (!response.ok) throw new Error(response.statusText);
            if (!response.body) throw new Error("No response body");

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = "";
            let buffer = "";
            let lastUpdate = 0;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    // Flush remaining buffer
                    if (buffer) {
                        aiContent += buffer;
                        messages[messages.length - 1].content = aiContent;
                    }
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n");

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const json = JSON.parse(line);
                        if (json.message?.content) {
                            buffer += json.message.content;
                        }
                    } catch (e) {
                        console.error("JSON parse error", e);
                    }
                }

                // Throttle updates to every 50ms
                const now = Date.now();
                if (now - lastUpdate > 50) {
                    aiContent += buffer;
                    buffer = "";
                    messages[messages.length - 1].content = aiContent;
                    lastUpdate = now;

                    if (chatContainer) {
                        requestAnimationFrame(() => {
                            chatContainer.scrollTo({
                                top: chatContainer.scrollHeight,
                                behavior: "auto",
                            });
                        });
                    }
                }
            }
        } catch (error) {
            console.error("Chat error:", error);
            messages = [
                ...messages,
                { role: "system", content: "Error: Failed to get response." },
            ];
        } finally {
            isLoading = false;
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
</script>

<div class="layout">
    <!-- Sidebar -->
    <aside class="sidebar">
        <div class="sidebar-header">
            <div class="user-item">
                <div class="avatar">나</div>
                <span class="username">내 워크스페이스</span>
            </div>
        </div>
        <div class="sidebar-menu">
            <div class="menu-item active">
                <span class="icon"></span>
                대화하기
            </div>
            <div class="menu-item">
                <span class="icon"></span>
                검색
            </div>
            <div class="menu-item">
                <span class="icon"></span>
                설정
            </div>
        </div>
    </aside>

    <!-- Main Chat Area -->
    <main class="chat-area">
        <div class="chat-header">
            <h2>채팅</h2>
            <span class="status-badge">비공개</span>
        </div>

        <div class="messages-container" bind:this={chatContainer}>
            {#if messages.length === 0}
                <div class="empty-state">
                    <h3>무엇을 도와드릴까요?</h3>
                </div>
            {/if}

            {#each messages as msg}
                <div class="message-wrapper {msg.role}">
                    <div class="message-avatar">
                        {msg.role === "user" ? "나" : "AI"}
                    </div>
                    <div class="message-content">
                        <div class="sender-name">
                            {msg.role === "user" ? "나" : "Gemma"}
                        </div>
                        <div class="text markdown">
                            {#if msg.role === "assistant" && msg.content === ""}
                                <span class="thinking">생각 중...</span>
                            {:else if msg.role === "assistant"}
                                {@html marked.parse(msg.content)}
                            {:else}
                                {msg.content}
                            {/if}
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        <div class="input-area">
            <div class="input-wrapper">
                <textarea
                    bind:value={inputValue}
                    onkeydown={handleKeydown}
                    disabled={isLoading}
                    placeholder="메시지를 입력하세요..."
                    rows="1"
                ></textarea>
                <button
                    class="send-btn"
                    onclick={sendMessage}
                    disabled={isLoading || !inputValue.trim()}
                >
                    {#if isLoading}
                        <span class="spinner"></span>
                    {:else}
                        ↑
                    {/if}
                </button>
            </div>
            <div class="input-footer">Running on localhost • gemma3:4b</div>
        </div>
    </main>
</div>

<style>
    .layout {
        display: flex;
        height: 100vh;
        width: 100vw;
        background-color: var(--bg-primary);
    }

    /* Sidebar */
    .sidebar {
        width: var(--sidebar-width);
        background-color: var(--bg-secondary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        padding: 12px;
    }

    .user-item {
        display: flex;
        align-items: center;
        padding: 8px;
        cursor: pointer;
        border-radius: var(--border-radius-sm);
    }
    .user-item:hover {
        background: rgba(255, 255, 255, 0.05);
    }

    .avatar {
        width: 20px;
        height: 20px;
        background: #444;
        color: #ddd;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        border-radius: 3px;
        margin-right: 8px;
    }

    .sidebar-menu {
        margin-top: 16px;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 6px 8px;
        color: var(--text-secondary);
        font-size: 14px;
        border-radius: var(--border-radius-sm);
        cursor: pointer;
        margin-bottom: 2px;
    }
    .menu-item:hover {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-primary);
    }
    .menu-item.active {
        background: rgba(255, 255, 255, 0.08);
        color: var(--text-primary);
        font-weight: 500;
    }
    .menu-item .icon {
        margin-right: 8px;
        font-size: 16px;
    }

    /* Main Chat */
    .chat-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        position: relative;
    }

    .chat-header {
        height: 48px;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        position: sticky;
        top: 0;
        background: rgba(25, 25, 25, 0.8);
        backdrop-filter: blur(10px);
        z-index: 10;
    }
    .chat-header h2 {
        font-size: 14px;
        font-weight: 500;
        margin: 0;
        color: var(--text-primary);
    }
    .status-badge {
        font-size: 12px;
        color: var(--text-secondary);
        background: var(--bg-secondary);
        padding: 2px 6px;
        border-radius: 4px;
    }

    .messages-container {
        flex: 1;
        overflow-y: auto;
        padding: 20px 0;
        display: flex;
        flex-direction: column;
        gap: 24px;
        scroll-behavior: smooth;
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--text-secondary);
    }

    .message-wrapper {
        display: flex;
        max-width: var(--max-content-width);
        width: 100%;
        margin: 0 auto;
        padding: 0 16px;
        animation: fadeIn 0.3s ease;
        margin-bottom: 24px; /* Space between messages */
    }

    .message-avatar {
        width: 28px;
        height: 28px;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 12px;
        flex-shrink: 0; /* Prevent avatar shrinking */
    }
    .message-wrapper.user .message-avatar {
        background: #4a4a4a;
        font-size: 14px;
    }
    .message-wrapper.assistant .message-avatar {
        background: var(--accent-color);
        color: white;
    }

    .message-content {
        flex: 1;
        min-width: 0; /* Enable text wrapping */
    }
    .sender-name {
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
        color: var(--text-secondary);
    }
    .text {
        font-size: 15px;
        line-height: 1.6;
        padding: 12px 16px;
        border-radius: 12px;
        background-color: #262626; /* Default message block bg */
        color: var(--text-primary);
        width: fit-content;
        max-width: 100%;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .message-wrapper.user {
        flex-direction: row-reverse;
    }
    .message-wrapper.user .message-avatar {
        margin-right: 0;
        margin-left: 12px;
    }
    .message-wrapper.user .message-content {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
    }
    .message-wrapper.user .text {
        background-color: #383838;
        border-bottom-right-radius: 2px;
    }
    .message-wrapper.assistant .text {
        background-color: #2f2f2f;
        border-top-left-radius: 2px;
    }

    /* Input Area */
    .input-area {
        padding: 24px 0;
        background: linear-gradient(
            to bottom,
            rgba(25, 25, 25, 0),
            var(--bg-primary) 20%
        );
    }

    .input-wrapper {
        max-width: var(--max-content-width);
        width: calc(100% - 32px);
        margin: 0 auto;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        border-radius: 12px;
        padding: 10px 12px;
        display: flex;
        align-items: flex-end;
        transition: border-color 0.2s;
    }
    .input-wrapper:focus-within {
        border-color: #555;
    }

    textarea {
        flex: 1;
        border: none;
        background: transparent;
        resize: none;
        padding: 8px 0;
        font-family: var(--font-sans);
        font-size: 15px;
        max-height: 200px;
        outline: none;
        color: var(--text-primary);
    }
    textarea::placeholder {
        color: #666;
    }

    .send-btn {
        background: #333;
        color: #eee;
        border: none;
        border-radius: 8px;
        width: 32px;
        height: 32px;
        margin-left: 8px;
        margin-bottom: 2px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
    }
    .send-btn:disabled {
        background: #2c2c2c;
        cursor: default;
        color: #555;
    }
    .send-btn:hover:not(:disabled) {
        background: #444;
    }

    .input-footer {
        text-align: center;
        font-size: 11px;
        color: #555;
        margin-top: 8px;
    }

    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: white;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .thinking {
        color: var(--text-secondary);
        font-style: italic;
        font-size: 14px;
        animation: pulse 1.5s infinite;
    }
    @keyframes pulse {
        0% {
            opacity: 0.5;
        }
        50% {
            opacity: 1;
        }
        100% {
            opacity: 0.5;
        }
    }
</style>
