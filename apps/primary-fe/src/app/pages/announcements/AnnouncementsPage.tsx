import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/empty-state/EmptyState'
import { useBatches } from '@/hooks/useAdmin'

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

  const handleCreateAnnouncement = () => {
    console.log('Create announcement:', newAnnouncement)
    setIsCreateDialogOpen(false)
    setNewAnnouncement({ title: '', content: '', batchId: '' })
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
                  disabled={!newAnnouncement.content.trim() || !newAnnouncement.batchId}
                >
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

      {/* Empty State */}
      <Card>
        <CardContent className="py-16">
          <EmptyState
            icon={Megaphone}
            title="No announcements yet"
            description="Send your first announcement to keep your students informed."
            action={{
              label: "Send Announcement",
              onClick: () => setIsCreateDialogOpen(true)
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
