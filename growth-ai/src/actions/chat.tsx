import type { Conversation } from '@/types/chat';
import { fetcher , endpoints } from '@/utils/axios';
import useSWR, { mutate } from 'swr';
import { useMemo } from 'react';
// ----------------------------------------------------------------------

const swrOptions = {
  revalidateIfStale: true,     
  revalidateOnFocus: false,    
  revalidateOnReconnect: true, 
};
  
// ----------------------------------------------------------------------
export function useGetConversations() {
  const url = endpoints.dashboard.chat.list;

  const { data, isLoading, error, isValidating } = useSWR<Conversation[]>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      conversations: data || [],
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !data?.length,
      refetchEvaluations: () => mutate(url),
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------
export function useGetConversation(conversationId: string) {
  const url = endpoints.dashboard.chat.get(conversationId);

  const { data, isLoading, error } = useSWR<Conversation>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      conversation: data || {},
      conversationLoading: isLoading,
      conversationError: error,
    }),
    [data, error, isLoading]
  );

  return memoizedValue;
}
// ----------------------------------------------------------------------
export function useDeleteConversation() {

  const deleteConversation = async (conversationId: string) => {
    const response = await fetcher(
      endpoints.dashboard.chat.deleteConversation(conversationId), 'delete', { conversationId });
      mutate(endpoints.dashboard.chat.list);
      return response;
  };

  return { deleteConversation };
}

// ----------------------------------------------------------------------
export function useRegenerateAnswer() {
  const regenerateAnswer = async ({ message, sender }: { message: string; sender: string }, conversationId: string) => {
    const response = await fetcher(
      endpoints.dashboard.chat.sendMessage(conversationId), 'post', { message, sender });
    mutate(endpoints.dashboard.chat.list);
    return response;
  };

  return { regenerateAnswer };
}

// ----------------------------------------------------------------------
export function useCreateConversation() {
  const url = endpoints.dashboard.chat.create;

  const createConversation = async ({title}: {title : string}) => {
    const response = await fetcher(url, 'post', { title });
    mutate(endpoints.dashboard.chat.list);
    return response;
  };

  return { createConversation };
}