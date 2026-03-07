import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Search,
  MoreHorizontal,
  Upload,
  Download,
  FileText,
  Video,
  Image,
  File,
  FolderOpen,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { formatDate } from '@/lib/utils'
import { useResources, useSubjects, useBatches, useCreateResource } from '@/hooks/useAdmin'
import { toast } from 'sonner'
import type { Resource, Subject, Batch } from '@/api/admin.api'

function getFileIcon(type: string) {
  switch (type?.toLowerCase()) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />
    case 'video':
      return <Video className="h-5 w-5 text-blue-500" />
    case 'image':
      return <Image className="h-5 w-5 text-green-500" />
    default:
      return <File className="h-5 w-5 text-muted-foreground" />
  }
}

export function ResourcesPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('all')
  const [batchFilter, setBatchFilter] = useState('all')
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [newResource, setNewResource] = useState({ title: '', url: '', type: 'pdf', subjectId: '', batchId: '' })

  const isTeacherOrAdmin = user?.role === 'TEACHER' || user?.role === 'ADMIN'

  // React Query hooks
  const { data: resourcesData, isLoading, error } = useResources()
  const { data: subjectsData } = useSubjects()
  const { data: batchesData } = useBatches()
  const createResourceMutation = useCreateResource()

  const resources = resourcesData || []
  const subjects = subjectsData || []
  const batches = batchesData || []

  const filteredResources = resources.filter((resource: Resource) => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSubject = subjectFilter === 'all' || resource.subject?.id === subjectFilter
    const matchesBatch = batchFilter === 'all' || resource.batch.id === batchFilter
    return matchesSearch && matchesSubject && matchesBatch
  })

  const handleCreateResource = async () => {
    if (!newResource.title.trim() || !newResource.url.trim() || !newResource.batchId) {
      toast.error('Title, URL, and batch are required')
      return
    }
    try {
      await createResourceMutation.mutateAsync({
        title: newResource.title,
        fileUrl: newResource.url,
        fileType: newResource.type.toUpperCase(),
        subjectId: newResource.subjectId || undefined,
        batchId: newResource.batchId,
      })
      toast.success('Resource created successfully')
      setIsUploadDialogOpen(false)
      setNewResource({ title: '', url: '', type: 'pdf', subjectId: '', batchId: '' })
    } catch (err) {
      toast.error('Failed to create resource')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-destructive">Failed to load resources</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl md:text-3xl">Resources</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isTeacherOrAdmin ? 'Upload and manage study materials.' : 'Access study materials and resources.'}
          </p>
        </div>
        {isTeacherOrAdmin && (
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Resource
          </Button>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Resource</DialogTitle>
            <DialogDescription>Add a new study resource.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="e.g., Physics Chapter 1 Notes"
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                placeholder="https://..."
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newResource.type}
                onValueChange={(value) => setNewResource({ ...newResource, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="LINK">Link</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject (optional)</Label>
              <Select
                value={newResource.subjectId}
                onValueChange={(value) => setNewResource({ ...newResource, subjectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject: Subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="batch">Batch (required)</Label>
              <Select
                value={newResource.batchId}
                onValueChange={(value) => setNewResource({ ...newResource, batchId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch: Batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      {batch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateResource} disabled={createResourceMutation.isPending}>
              {createResourceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Resources</p>
              <p className="font-stat text-2xl font-semibold">{resources.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PDFs</p>
              <p className="font-stat text-2xl font-semibold">
                {resources.filter((r: Resource) => r.fileType?.toUpperCase() === 'PDF').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Videos</p>
              <p className="font-stat text-2xl font-semibold">
                {resources.filter((r: Resource) => r.fileType?.toUpperCase() === 'VIDEO').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={subjectFilter} onValueChange={setSubjectFilter}>
          <SelectTrigger className="w-37.5">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject: Subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={batchFilter} onValueChange={setBatchFilter}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Batch" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Batches</SelectItem>
            {batches.map((batch: Batch) => (
              <SelectItem key={batch.id} value={batch.id}>
                {batch.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Resources Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource: Resource) => (
          <Card key={resource.id} className="group transition-colors hover:bg-[hsl(var(--background-subtle))]">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
                    {getFileIcon(resource.fileType || 'other')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-medium">{resource.title}</h3>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.fileType || 'FILE'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>{resource.subject?.name || 'General'}</span>
                <span>{resource.batch?.name || 'All Batches'}</span>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                {formatDate(resource.createdAt)}
              </div>

              <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Open
                </a>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No resources found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
