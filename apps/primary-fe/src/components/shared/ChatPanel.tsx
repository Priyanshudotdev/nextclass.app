import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Megaphone, Pin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Toggle } from '@/components/ui/toggle'
import { cn, getInitials } from '@/lib/utils'

interface Message {
  id: string
  content: string
  senderId: string
  senderName: string
  timestamp: string
  isAnnouncement?: boolean
  isOwn?: boolean
}

interface PinnedMessage {
  id: string
  content: string
}

interface ChatPanelProps {
  messages: Message[]
  pinnedMessage?: PinnedMessage | null
  currentUserId: string
  isTeacherOrAdmin?: boolean
  onSendMessage: (content: string, isAnnouncement: boolean) => void
  onDismissPinned?: () => void
  className?: string
}

export function ChatPanel({
  messages,
  pinnedMessage,
  currentUserId,
  isTeacherOrAdmin = false,
  onSendMessage,
  onDismissPinned,
  className,
}: ChatPanelProps) {
  const [message, setMessage] = useState('')
  const [isAnnouncement, setIsAnnouncement] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!message.trim()) return
    onSendMessage(message, isAnnouncement)
    setMessage('')
    setIsAnnouncement(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group messages by date
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = new Date(msg.timestamp).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {} as Record<string, Message[]>)

  return (
    <div className={cn('flex h-full flex-col', className)}>
      {/* Pinned Message */}
      {pinnedMessage && (
        <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
          <Pin className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 truncate text-sm">
            <span className="font-medium">Pinned:</span> {pinnedMessage.content}
          </span>
          {onDismissPinned && (
            <button
              className="text-xs text-muted-foreground hover:text-primary"
              onClick={onDismissPinned}
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            {/* Date Separator */}
            <div className="my-4 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">{date}</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Messages */}
            {msgs.map((msg) => (
              <div key={msg.id} className="mb-4">
                {msg.isAnnouncement ? (
                  // Announcement Message
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Megaphone className="h-4 w-4 text-amber-600" />
                      <span className="text-xs font-medium uppercase tracking-wider text-amber-700">
                        Announcement
                      </span>
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Posted by {msg.senderName} ·{' '}
                      {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                ) : msg.senderId === currentUserId ? (
                  // Own Message (right-aligned)
                  <div className="flex justify-end">
                    <div className="max-w-[70%]">
                      <div className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}{' '}
                        ✓✓
                      </p>
                    </div>
                  </div>
                ) : (
                  // Other User Message (left-aligned)
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {getInitials(msg.senderName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-[70%]">
                      <p className="mb-1 text-xs font-medium">{msg.senderName}</p>
                      <div className="rounded-lg bg-muted px-4 py-2">
                        <p className="text-sm">{msg.content}</p>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="border-t p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0">
            <Paperclip className="h-4 w-4" />
          </Button>
          <Input
            placeholder="Send a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          {isTeacherOrAdmin && (
            <Toggle
              pressed={isAnnouncement}
              onPressedChange={setIsAnnouncement}
              size="sm"
              className="shrink-0"
              aria-label="Toggle announcement"
            >
              <Megaphone className="h-4 w-4" />
            </Toggle>
          )}
          <Button size="icon" onClick={handleSend} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        {isAnnouncement && (
          <p className="mt-2 text-xs text-amber-600">
            This message will be sent as an announcement
          </p>
        )}
      </div>
    </div>
  )
}
