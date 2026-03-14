import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Megaphone,
  Search,
  Plus,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/empty-state/EmptyState'
import { useBatches } from '@/hooks/useAdmin'
import {
  useChatMessages,
  useChatRooms,
  useSendAnnouncement,
  useSendInstituteAnnouncement,
} from '@/hooks/useChat'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'

export function AnnouncementsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [batchFilter, setBatchFilter] = useState('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    batchId: '',
  })

  // Fetch batches for the dropdown
  const { data: batches } = useBatches({})
  const { data: chatRooms } = useChatRooms()
  const sendAnnouncementMutation = useSendAnnouncement()
  const sendInstituteAnnouncementMutation = useSendInstituteAnnouncement()

  const instituteRoom = chatRooms?.find(
    (room) => room.type === 'ANNOUNCEMENT' && !room.batch,
  )
  const targetRoomId =
    batchFilter === 'all'
      ? (instituteRoom?.id ?? null)
      : (chatRooms?.find(
          (room) => room.batch?.id === batchFilter && room.type !== 'ANNOUNCEMENT',
        )?.id ?? null)

  const { data: rawMessages, isLoading: isLoadingAnnouncements } = useChatMessages(targetRoomId)

  const announcements =
    rawMessages
      ?.filter((message) =>
        batchFilter === 'all' ? true : (message.isAnnouncement ?? false),
      )
      .filter((message) => {
        const query = searchQuery.trim().toLowerCase()
        if (!query) return true
        return (
          message.content.toLowerCase().includes(query) ||
          message.sender.name.toLowerCase().includes(query)
        )
      }) ?? []

  const isSubmitting =
    sendAnnouncementMutation.isPending || sendInstituteAnnouncementMutation.isPending

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.content.trim() || !newAnnouncement.batchId) return

    const content = newAnnouncement.title.trim()
      ? `${newAnnouncement.title.trim()}\n\n${newAnnouncement.content.trim()}`
      : newAnnouncement.content.trim()

    try {
      if (newAnnouncement.batchId === 'all') {
        await sendInstituteAnnouncementMutation.mutateAsync({ content })
      } else {
        const room = chatRooms?.find(
          (item) => item.batch?.id === newAnnouncement.batchId && item.type !== 'ANNOUNCEMENT',
        )
        if (!room) {
          toast.error('No chat room found for selected batch')
          return
        }
        await sendAnnouncementMutation.mutateAsync({
          chatRoomId: room.id,
          input: { content, isAnnouncement: true },
        })
      }

      toast.success('Announcement sent successfully')
      setIsCreateDialogOpen(false)
      setNewAnnouncement({ title: '', content: '', batchId: '' })
    } catch {
      toast.error('Failed to send announcement')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Announcements"
        rightContent={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Send Announcement
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Announcement</DialogTitle>
                <DialogDescription>
                  Send an announcement to one or more batches.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title (optional)</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Test Scheduled"
                    value={newAnnouncement.title}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, title: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">Message</Label>
                  <Textarea
                    id="content"
                    placeholder="Write your announcement..."
                    value={newAnnouncement.content}
                    onChange={(e) =>
                      setNewAnnouncement({ ...newAnnouncement, content: e.target.value })
                    }
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-right text-xs text-muted-foreground">
                    {newAnnouncement.content.length}/500
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch">Select Batch</Label>
                  <Select
                    value={newAnnouncement.batchId}
                    onValueChange={(value) =>
                      setNewAnnouncement({ ...newAnnouncement, batchId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Batches</SelectItem>
                      {batches?.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAnnouncement}
                  disabled={
                    !newAnnouncement.content.trim() ||
                    !newAnnouncement.batchId ||
                    isSubmitting
                  }
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Announcement
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches?.map((batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Announcement List */}
      <Card>
        <CardContent className="py-6">
          {isLoadingAnnouncements ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{announcement.sender.role ?? 'STAFF'}</Badge>
                      <span className="text-sm font-medium">{announcement.sender.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(announcement.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Megaphone}
              title="No announcements yet"
              description="Send your first announcement to keep your students informed."
              action={{
                label: 'Send Announcement',
                onClick: () => setIsCreateDialogOpen(true),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
