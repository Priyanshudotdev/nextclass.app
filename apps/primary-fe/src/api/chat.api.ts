import api from '@/lib/axios';

// ============================================
// Types
// ============================================

export type MessageType = 'TEXT' | 'FILE' | 'IMAGE';

export interface ChatRoom {
  id: string;
  name: string;
  type: string;
  batch: { id: string; name: string };
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  messageType: MessageType;
  fileUrl?: string | null;
  sender: {
    id: string;
    name: string;
    role?: string;
  };
  isAnnouncement?: boolean;
  isPinned?: boolean;
  pinnedAt?: string | null;
  createdAt: string;
}

export interface SendMessageInput {
  content: string;
  messageType?: MessageType;
  fileUrl?: string;
}

export interface MessageQueryParams {
  limit?: number;
  before?: string;
}

// ============================================
// API Response Types
// ============================================

interface ApiResponse<T> {
  data: T;
  error?: string;
}

// ============================================
// Student Chat APIs (/api/student)
// ============================================

export async function getStudentChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get<ApiResponse<ChatRoom[]>>('/api/student/chatrooms');
  return res.data.data;
}

export async function getStudentChatMessages(
  chatRoomId: string,
  params?: MessageQueryParams,
): Promise<ChatMessage[]> {
  const res = await api.get<ApiResponse<ChatMessage[]>>(
    `/api/student/chatrooms/${chatRoomId}/messages`,
    { params },
  );
  return res.data.data;
}

export async function sendStudentMessage(
  chatRoomId: string,
  input: SendMessageInput,
): Promise<ChatMessage> {
  const res = await api.post<ApiResponse<ChatMessage>>(
    `/api/student/chatrooms/${chatRoomId}/messages`,
    input,
  );
  return res.data.data;
}

// ============================================
// Teacher Chat APIs (/api/teacher)
// ============================================

export async function getTeacherChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get<ApiResponse<ChatRoom[]>>('/api/teacher/chat-rooms');
  return res.data.data;
}

export async function getTeacherChatMessages(
  chatRoomId: string,
  params?: MessageQueryParams,
): Promise<ChatMessage[]> {
  const res = await api.get<ApiResponse<ChatMessage[]>>(
    `/api/teacher/chat-rooms/${chatRoomId}/messages`,
    { params },
  );
  return res.data.data;
}

export async function sendTeacherMessage(
  chatRoomId: string,
  input: SendMessageInput,
): Promise<ChatMessage> {
  const res = await api.post<ApiResponse<ChatMessage>>(
    `/api/teacher/chat-rooms/${chatRoomId}/messages`,
    input,
  );
  return res.data.data;
}

export async function sendTeacherAnnouncement(
  chatRoomId: string,
  input: SendMessageInput,
): Promise<ChatMessage> {
  const res = await api.post<ApiResponse<ChatMessage>>(
    `/api/teacher/chat-rooms/${chatRoomId}/announcements`,
    input,
  );
  return res.data.data;
}

export async function getPinnedMessages(
  chatRoomId: string,
): Promise<ChatMessage[]> {
  const res = await api.get<ApiResponse<ChatMessage[]>>(
    `/api/teacher/chat-rooms/${chatRoomId}/pinned`,
  );
  return res.data.data;
}

export async function pinMessage(
  chatRoomId: string,
  messageId: string,
): Promise<ChatMessage> {
  const res = await api.post<ApiResponse<ChatMessage>>(
    `/api/teacher/chat-rooms/${chatRoomId}/messages/${messageId}/pin`,
  );
  return res.data.data;
}

export async function unpinMessage(
  chatRoomId: string,
  messageId: string,
): Promise<void> {
  await api.delete(
    `/api/teacher/chat-rooms/${chatRoomId}/messages/${messageId}/pin`,
  );
}

// ============================================
// Admin Chat APIs (/api/admin)
// ============================================

export async function getAdminChatRooms(): Promise<ChatRoom[]> {
  const res = await api.get<ApiResponse<ChatRoom[]>>('/api/admin/chatrooms');
  return res.data.data;
}
