import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as chatApi from '@/api/chat.api';
import type {
  ChatMessage,
  SendMessageInput,
  MessageQueryParams,
} from '@/api/chat.api';
import { useAuth } from '@/hooks/use-auth';

// ============================================
// Query Keys
// ============================================

export const chatKeys = {
  all: ['chat'] as const,
  rooms: (role: string) => [...chatKeys.all, 'rooms', role] as const,
  messages: (chatRoomId: string) =>
    [...chatKeys.all, 'messages', chatRoomId] as const,
  pinnedMessages: (chatRoomId: string) =>
    [...chatKeys.all, 'pinned', chatRoomId] as const,
};

// ============================================
// Chat Rooms
// ============================================

export function useChatRooms() {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  return useQuery({
    queryKey: chatKeys.rooms(role),
    queryFn: () => {
      switch (role) {
        case 'ADMIN':
          return chatApi.getAdminChatRooms();
        case 'TEACHER':
          return chatApi.getTeacherChatRooms();
        case 'STUDENT':
        default:
          return chatApi.getStudentChatRooms();
      }
    },
    enabled: !!user,
  });
}

// ============================================
// Chat Messages
// ============================================

export function useChatMessages(
  chatRoomId: string | null,
  params?: MessageQueryParams,
) {
  const { user } = useAuth();
  const role = user?.role || 'STUDENT';

  return useQuery({
    queryKey: chatKeys.messages(chatRoomId || ''),
    queryFn: () => {
      if (!chatRoomId) return [];
      switch (role) {
        case 'TEACHER':
        case 'ADMIN':
          return chatApi.getTeacherChatMessages(chatRoomId, params);
        case 'STUDENT':
        default:
          return chatApi.getStudentChatMessages(chatRoomId, params);
      }
    },
    enabled: !!chatRoomId && !!user,
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });
}

// ============================================
// Send Message
// ============================================

export function useSendMessage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role || 'STUDENT';

  return useMutation({
    mutationFn: ({
      chatRoomId,
      input,
    }: {
      chatRoomId: string;
      input: SendMessageInput;
    }) => {
      switch (role) {
        case 'TEACHER':
        case 'ADMIN':
          return chatApi.sendTeacherMessage(chatRoomId, input);
        case 'STUDENT':
        default:
          return chatApi.sendStudentMessage(chatRoomId, input);
      }
    },
    onSuccess: (newMessage, { chatRoomId }) => {
      // Optimistically add the new message to the list
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(chatRoomId),
        (old) => (old ? [...old, newMessage] : [newMessage]),
      );
    },
  });
}

// ============================================
// Send Announcement (Teacher only)
// ============================================

export function useSendAnnouncement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatRoomId,
      input,
    }: {
      chatRoomId: string;
      input: SendMessageInput;
    }) => chatApi.sendTeacherAnnouncement(chatRoomId, input),
    onSuccess: (newMessage, { chatRoomId }) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(chatRoomId),
        (old) => (old ? [...old, newMessage] : [newMessage]),
      );
    },
  });
}

// ============================================
// Pinned Messages
// ============================================

export function usePinnedMessages(chatRoomId: string | null) {
  return useQuery({
    queryKey: chatKeys.pinnedMessages(chatRoomId || ''),
    queryFn: () => (chatRoomId ? chatApi.getPinnedMessages(chatRoomId) : []),
    enabled: !!chatRoomId,
  });
}

export function usePinMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatRoomId,
      messageId,
    }: {
      chatRoomId: string;
      messageId: string;
    }) => chatApi.pinMessage(chatRoomId, messageId),
    onSuccess: (_, { chatRoomId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(chatRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.pinnedMessages(chatRoomId),
      });
    },
  });
}

export function useUnpinMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chatRoomId,
      messageId,
    }: {
      chatRoomId: string;
      messageId: string;
    }) => chatApi.unpinMessage(chatRoomId, messageId),
    onSuccess: (_, { chatRoomId }) => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(chatRoomId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.pinnedMessages(chatRoomId),
      });
    },
  });
}
