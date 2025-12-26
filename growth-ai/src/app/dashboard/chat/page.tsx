import { CONFIG } from '@/config-global';
export const runtime = 'edge';
import { ChatView } from '@/sections/chat/view/chat-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Chat AI | Dashboard - ${CONFIG.site.name}` };

export default function Page() {
  return <ChatView />;
}