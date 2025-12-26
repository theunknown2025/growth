"use client"
import { Button } from "@/shadcn/ui/button"
import { MessageSquare, Plus, Trash } from "lucide-react"
import { useChat } from "@/hooks/use-chat"
import { Conversation } from "@/types/chat"
import { useDeleteConversation } from "@/actions/chat"
import { toast } from "react-toastify"
import { useEffect } from "react"

type ChatHistoryProps = {
  conversations: Conversation[]
  onConversationSelect: (conversationId: string) => void
  setShowWelcome: (show: boolean) => void
  deletechat: () => void
}

export function ChatHistory({ conversations, onConversationSelect ,setShowWelcome , deletechat}: ChatHistoryProps) {

  const handleNewChat = () => {
    deletechat()
  }

  return (
    <div className="flex flex-col h-full w-full mr-4">
      <div className="p-4 border-b border-purple-primary/20">
        <h2 className="text-base font-medium text-white mb-4">Chat History</h2>
        <Button
          className="w-full justify-start gap-2 bg-gradient-to-r from-purple-light to-purple-primary hover:opacity-90"
          onClick={handleNewChat}
        >
          <Plus size={16} />
          <span>New Chat</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <ChatHistorySection 
          conversations={conversations} 
          onConversationSelect={onConversationSelect} 
          setShowWelcome={setShowWelcome}
          deletechat={deletechat}
        />
      </div>
    </div>
  )
}

function ChatHistorySection({ conversations, onConversationSelect , setShowWelcome , deletechat}: { 
  conversations: Conversation[]
  onConversationSelect: (conversationId: string) => void
  setShowWelcome: (show: boolean) => void
  deletechat: (conversationId: string) => void
}) {
  const chatHistory = conversations.map((conversation) => ({
    id: conversation._id,
    title: conversation.title,
    date: conversation.createdAt
      ? new Date(conversation.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString(),
  }))

  const { deleteConversation } = useDeleteConversation()
  
  const groupedHistory = chatHistory.reduce((acc, chat) => {
    if (!acc[chat.date]) {
      acc[chat.date] = []
    }
    acc[chat.date].push(chat)
    return acc
  }, {} as Record<string, typeof chatHistory>)

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      // Deleting the conversation
      await deleteConversation(conversationId);
  
      // Success message
      toast.success("Conversation deleted successfully.");
  
      // Ensure the welcome screen is shown and conversation ID is cleared
      setShowWelcome(true);
      deletechat(""); // Call the deletechat function to remove it from the list
  
      // Optional: You could also remove the conversation from the local state if you store it locally.
    } catch (error) {
      // Error handling
      toast.error("Failed to delete conversation.");
    }
  };
  
  useEffect(() => {
    if (conversations.length === 0) {
      setShowWelcome(true);
      deletechat(""); // Clear the conversation ID when there are no conversations
    }
  }, [conversations]);

  return (
    <div className="py-2 space-y-4">
      {Object.entries(groupedHistory)
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .map(([date, chats]) => (
        <div key={date} className="mb-4">
        <h3 className="text-xs uppercase tracking-wider text-purple-light/70 px-4 mb-1">
          {(() => {
          const conversationDate = new Date(date);
          const today = new Date();
          if (conversationDate.toDateString() === today.toDateString()) {
            return "Today";
          }
          const yesterday = new Date();
          yesterday.setDate(today.getDate() - 1);
          if (conversationDate.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
          }
          return conversationDate.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          })()}
        </h3>
        <div className="space-y-2">
          {chats.map((chat) => (
          <div key={chat.id} className="flex items-center justify-between">
            <Button
            variant="ghost"
            className="flex-1 justify-start gap-2 px-4 py-2 h-auto text-sm font-normal text-white/70 hover:text-white hover:bg-purple-primary/10"
            onClick={() => onConversationSelect(chat.id)}
            >
            <MessageSquare size={16} className="shrink-0" />
            <span className="truncate" title={chat.title}>
              {chat.title.length > 25 ? chat.title.slice(0, 24) + "..." : chat.title}
            </span>
            </Button>
            <Button
            variant="ghost"
            className="px-2"
            onClick={() => handleDeleteConversation(chat.id)}
            >
            <Trash size={16} className="text-purple-primary" />
            </Button>
          </div>
          ))}
        </div>
        </div>
      ))}
    </div>
  )
}
