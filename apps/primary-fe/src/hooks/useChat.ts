import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as chatApi from '@/api/chat.api';
import type {
  ChatMessage,
  SendMessageInput,
  MessageQueryParams,
  MessagingMode,
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
  instituteRoom: ['chat', 'institute-room'] as const,
};

function normalizeMessages(messages: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>();
  for (const message of messages) {
    byId.set(message.id, message);
  }

  const deduped = Array.from(byId.values());
  deduped.sort((a, b) => {
    const at = new Date(a.createdAt).getTime();
    const bt = new Date(b.createdAt).getTime();
    if (at !== bt) return at - bt;
    return a.id.localeCompare(b.id);
  });

  return deduped;
}

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
        case 'ADMIN':
          return chatApi.getAdminChatMessages(chatRoomId, params);
        case 'TEACHER':
          return chatApi.getTeacherChatMessages(chatRoomId, params);
        case 'STUDENT':
        default:
          return chatApi.getStudentChatMessages(chatRoomId, params);
      }
    },
    enabled: !!chatRoomId && !!user,
    refetchInterval: 10000,
    select: (data) => normalizeMessages(data),
  });
}

export function useChatRealtime(chatRoomId: string | null) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!chatRoomId || !user) return;

    const wsUrl = import.meta.env.VITE_WS_URL ?? 'ws://localhost:8090/ws';
    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;
    let stopped = false;

    const connect = () => {
      if (stopped) return;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        attempts = 0;
        ws?.send(JSON.stringify({ type: 'join_room', roomId: chatRoomId }));
        queryClient.invalidateQueries({
          queryKey: chatKeys.messages(chatRoomId),
        });
      };

      ws.onmessage = (event) => {
        try {
          const incoming = JSON.parse(event.data) as {
            type?: string;
            roomId?: string;
            message?: ChatMessage;
          };

          if (
            incoming.type !== 'chat_message' ||
            incoming.roomId !== chatRoomId ||
            !incoming.message
          ) {
            return;
          }

          queryClient.setQueryData<ChatMessage[]>(
            chatKeys.messages(chatRoomId),
            (old = []) =>
              normalizeMessages([...old, incoming.message as ChatMessage]),
          );
        } catch {
          // Ignore non-chat events or malformed payloads.
        }
      };

      ws.onclose = () => {
        if (stopped) return;
        attempts += 1;
        const backoff = Math.min(1000 * 2 ** Math.min(attempts, 5), 10000);
        reconnectTimer = setTimeout(connect, backoff);
      };

      ws.onerror = () => {
        ws?.close();
      };
    };

    connect();

    return () => {
      stopped = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'leave_room', roomId: chatRoomId }));
      }
      ws?.close();
    };
  }, [chatRoomId, queryClient, user]);
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
        case 'ADMIN':
          return chatApi.sendAdminMessage(chatRoomId, input);
        case 'TEACHER':
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
        (old = []) => normalizeMessages([...old, newMessage]),
      );
    },
  });
}

// ============================================
// Send Announcement (Teacher only)
// ============================================

export function useSendAnnouncement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role || 'TEACHER';

  return useMutation({
    mutationFn: ({
      chatRoomId,
      input,
    }: {
      chatRoomId: string;
      input: SendMessageInput;
    }) => {
      if (role === 'ADMIN') {
        return chatApi.sendAdminMessage(chatRoomId, {
          ...input,
          messageType: input.messageType ?? 'TEXT',
          isAnnouncement: true,
        });
      }
      return chatApi.sendTeacherAnnouncement(chatRoomId, input);
    },
    onSuccess: (newMessage, { chatRoomId }) => {
      queryClient.setQueryData<ChatMessage[]>(
        chatKeys.messages(chatRoomId),
        (old = []) => normalizeMessages([...old, newMessage]),
      );
    },
  });
}

export function useUpdateChatRoom() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role || 'ADMIN';

  return useMutation({
    mutationFn: ({
      chatRoomId,
      messagingMode,
    }: {
      chatRoomId: string;
      messagingMode: MessagingMode;
    }) => chatApi.updateChatRoom(chatRoomId, { messagingMode }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms(role) });
    },
  });
}

export function useInstituteAnnouncementRoom() {
  return useQuery({
    queryKey: chatKeys.instituteRoom,
    queryFn: chatApi.getInstituteAnnouncementRoom,
  });
}

export function useSendInstituteAnnouncement() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const role = user?.role || 'ADMIN';

  return useMutation({
    mutationFn: (input: SendMessageInput) =>
      role === 'TEACHER'
        ? chatApi.sendTeacherInstituteAnnouncement(input)
        : chatApi.sendInstituteAnnouncement(input),
    onSuccess: (newMessage) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.instituteRoom });
      // Append to any cached message lists where this room is selected
      queryClient.setQueriesData<ChatMessage[]>(
        { queryKey: [...chatKeys.all, 'messages'] },
        (old) => (old ? normalizeMessages([...old, newMessage]) : old),
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
