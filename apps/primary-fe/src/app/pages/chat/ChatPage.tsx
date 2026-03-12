import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  MessageSquare,
  Send,
  Loader2,
  Pin,
  MoreVertical,
  Megaphone,
  ArrowLeft,
} from 'lucide-react'
import { cn, getInitials, formatDate } from '@/lib/utils'
import { useAuth } from '@/hooks/use-auth'
import {
  useChatRooms,
  useChatMessages,
  useSendMessage,
  useSendAnnouncement,
  usePinMessage,
  useUnpinMessage,
} from '@/hooks/useChat'
import type { ChatMessage } from '@/api/chat.api'
import { toast } from 'sonner'

export function ChatPage() {
  const { user } = useAuth()
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageInput, setMessageInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  // Chat hooks
  const { data: chatRooms, isLoading: isLoadingRooms } = useChatRooms()
  const { data: messages, isLoading: isLoadingMessages } = useChatMessages(selectedRoomId)
  const sendMessageMutation = useSendMessage()
  const sendAnnouncementMutation = useSendAnnouncement()
  const pinMessageMutation = usePinMessage()
  const unpinMessageMutation = useUnpinMessage()

  const filteredRooms = chatRooms?.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const selectedRoom = chatRooms?.find((r) => r.id === selectedRoomId)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (isAnnouncement = false) => {
    if (!messageInput.trim() || !selectedRoomId) return

    try {
      const input = { content: messageInput.trim(), messageType: 'TEXT' as const }
      
      if (isAnnouncement && isTeacherOrAdmin) {
        await sendAnnouncementMutation.mutateAsync({
          chatRoomId: selectedRoomId,
          input,
        })
        toast.success('Announcement sent')
      } else {
        await sendMessageMutation.mutateAsync({
          chatRoomId: selectedRoomId,
          input,
        })
      }
      setMessageInput('')
    } catch (err) {
      toast.error('Failed to send message')
    }
  }

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    if (!selectedRoomId) return

    try {
      if (isPinned) {
        await unpinMessageMutation.mutateAsync({
          chatRoomId: selectedRoomId,
          messageId,
        })
        toast.success('Message unpinned')
      } else {
        await pinMessageMutation.mutateAsync({
          chatRoomId: selectedRoomId,
          messageId,
        })
        toast.success('Message pinned')
      }
    } catch (err) {
      toast.error('Failed to update pin status')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const isSending = sendMessageMutation.isPending || sendAnnouncementMutation.isPending

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-0 md:gap-4">
      {/* Room List */}
      <Card
        className={cn(
          'w-full md:w-80 md:shrink-0',
          selectedRoomId ? 'hidden md:block' : 'block'
        )}
      >
        <CardContent className="flex h-full flex-col p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search chat rooms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <ScrollArea className="flex-1">
            {isLoadingRooms ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
                ))}
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="space-y-1">
                {filteredRooms.map((room) => (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg p-3 text-left transition-colors',
                      selectedRoomId === room.id
                        ? 'bg-muted'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <span className="font-medium">{room.name}</span>
                      <p className="truncate text-sm text-muted-foreground">
                        {room.batch?.name || 'Batch'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">No chat rooms found</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user?.role === 'STUDENT' 
                    ? 'Enroll in a batch to join its chat room'
                    : 'Assign yourself to a batch to access its chat'}
                </p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Panel */}
      <Card className={cn('flex-1', selectedRoomId ? 'block' : 'hidden md:block')}>
        <CardContent className="flex h-full flex-col p-0">
          {selectedRoom ? (
            <>
              {/* Header */}
              <div className="flex items-center border-b p-4">
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="md:hidden"
                    onClick={() => setSelectedRoomId(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h2 className="font-semibold">{selectedRoom.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedRoom.batch?.name}</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {isLoadingMessages ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message: ChatMessage) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isOwn={message.sender.id === user?.id}
                        canPin={isTeacherOrAdmin}
                        onPin={() => handlePinMessage(message.id, message.isPinned || false)}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-10 w-10 text-muted-foreground" />
                    <p className="mt-3 text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground">Be the first to say hello!</p>
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isSending}
                    className="flex-1"
                  />
                  {isTeacherOrAdmin && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleSendMessage(true)}
                      disabled={!messageInput.trim() || isSending}
                      title="Send as announcement"
                    >
                      <Megaphone className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleSendMessage(false)}
                    disabled={!messageInput.trim() || isSending}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="hidden h-full flex-col items-center justify-center p-8 text-center md:flex">
              <MessageSquare className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-semibold">Select a Chat Room</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose a chat room from the left to start messaging.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
  canPin,
  onPin,
}: {
  message: ChatMessage
  isOwn: boolean
  canPin: boolean
  onPin: () => void
}) {
  return (
    <div className={cn('flex gap-3', isOwn && 'flex-row-reverse')}>
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className="text-xs">
          {getInitials(message.sender.name)}
        </AvatarFallback>
      </Avatar>
      <div className={cn('max-w-[70%] space-y-1', isOwn && 'items-end')}>
        <div className={cn('flex items-center gap-2', isOwn && 'flex-row-reverse')}>
          <span className="text-sm font-medium">{message.sender.name}</span>
          {message.sender.role && (
            <Badge variant="secondary" className="text-xs">
              {message.sender.role}
            </Badge>
          )}
          {message.isAnnouncement && (
            <Badge variant="default" className="text-xs">
              <Megaphone className="mr-1 h-3 w-3" />
              Announcement
            </Badge>
          )}
          {message.isPinned && (
            <Pin className="h-3 w-3 text-primary" />
          )}
        </div>
        <div
          className={cn(
            'rounded-lg p-3',
            isOwn
              ? 'bg-primary text-primary-foreground'
              : message.isAnnouncement
                ? 'border-2 border-primary/20 bg-primary/5'
                : 'bg-muted'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', isOwn && 'flex-row-reverse')}>
          <span>{formatDate(message.createdAt)}</span>
          {canPin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hover:text-foreground">
                  <MoreVertical className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={onPin}>
                  <Pin className="mr-2 h-4 w-4" />
                  {message.isPinned ? 'Unpin' : 'Pin'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
