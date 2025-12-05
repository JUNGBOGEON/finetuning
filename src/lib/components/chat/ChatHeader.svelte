<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	interface Props {
		title?: string;
		statusText?: string;
	}

	let { title = '채팅', statusText = '비공개' }: Props = $props();
</script>

<header class="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
	<Sidebar.Trigger class="-ml-1" />
	<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
	<h1 class="text-sm font-medium">{title}</h1>
	<span class="ml-auto text-xs text-muted-foreground bg-muted px-2 py-1 rounded">{statusText}</span>
</header>
