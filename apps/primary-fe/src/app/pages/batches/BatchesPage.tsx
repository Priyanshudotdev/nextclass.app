import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  Calendar,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useBatches, useCourses, useCreateBatch, useUpdateBatch, useDeleteBatch } from '@/hooks/useAdmin'
import { toast } from 'sonner'
import type { Batch, Course } from '@/api/admin.api'

export function BatchesPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState<{ id: string; name: string; courseId: string } | null>(null)
  const [newBatch, setNewBatch] = useState({ name: '', courseId: '', schedule: '' })

  const isAdmin = user?.role === 'ADMIN'

  // React Query hooks
  const { data: batchesData, isLoading, error } = useBatches()
  const { data: coursesData } = useCourses()
  const createBatchMutation = useCreateBatch()
  const updateBatchMutation = useUpdateBatch()
  const deleteBatchMutation = useDeleteBatch()

  const batches = batchesData || []
  const courses = coursesData || []

  const filteredBatches = batches.filter((batch: Batch) => {
    const matchesSearch = batch.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCourse = courseFilter === 'all' || batch.courseId === courseFilter
    const matchesStatus = statusFilter === 'all' || (batch.status?.toLowerCase() ?? '') === statusFilter
    return matchesSearch && matchesCourse && matchesStatus
  })

  const activeBatches = batches.filter((b: Batch) => b.status?.toLowerCase() === 'active').length

  const handleCreateBatch = async () => {
    if (!newBatch.name.trim() || !newBatch.courseId) {
      toast.error('Batch name and course are required')
      return
    }
    try {
      await createBatchMutation.mutateAsync({
        name: newBatch.name,
        courseId: newBatch.courseId,
        startDate: new Date().toISOString(),
      })
      toast.success('Batch created successfully')
      setIsCreateDialogOpen(false)
      setNewBatch({ name: '', courseId: '', schedule: '' })
    } catch (err) {
      toast.error('Failed to create batch')
    }
  }

  const handleUpdateBatch = async () => {
    if (!editingBatch) return
    try {
      await updateBatchMutation.mutateAsync({
        batchId: editingBatch.id,
        input: {
          name: editingBatch.name,
        },
      })
      toast.success('Batch updated successfully')
      setIsEditDialogOpen(false)
      setEditingBatch(null)
    } catch (err) {
      toast.error('Failed to update batch')
    }
  }

  const handleDeleteBatch = async (batchId: string) => {
    if (!confirm('Are you sure you want to delete this batch?')) return
    try {
      await deleteBatchMutation.mutateAsync(batchId)
      toast.success('Batch deleted successfully')
    } catch (err) {
      toast.error('Failed to delete batch')
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
          <p className="text-destructive">Failed to load batches</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Batches</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage batches and student groups.
          </p>
        </div>
        {isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Batch</DialogTitle>
                <DialogDescription>
                  Create a new batch for a course.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Batch Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., JEE 2026 - Batch A"
                    value={newBatch.name}
                    onChange={(e) => setNewBatch({ ...newBatch, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="course">Course</Label>
                  <Select
                    value={newBatch.courseId}
                    onValueChange={(value) => setNewBatch({ ...newBatch, courseId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course: Course) => (
                        <SelectItem key={course.id} value={course.id}>
                          {course.name}
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
                <Button onClick={handleCreateBatch} disabled={createBatchMutation.isPending}>
                  {createBatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Batch
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Batch</DialogTitle>
            <DialogDescription>Update batch details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Batch Name</Label>
              <Input
                id="edit-name"
                value={editingBatch?.name || ''}
                onChange={(e) => setEditingBatch(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-course">Course</Label>
              <Select
                value={editingBatch?.courseId || ''}
                onValueChange={(value) => setEditingBatch(prev => prev ? { ...prev, courseId: value } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course: Course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBatch} disabled={updateBatchMutation.isPending}>
              {updateBatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Batches</p>
              <p className="font-stat text-2xl font-semibold">{batches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Filtered Results</p>
              <p className="font-stat text-2xl font-semibold">{filteredBatches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Batches</p>
              <p className="font-stat text-2xl font-semibold">
                {activeBatches}
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
            placeholder="Search batches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Courses</SelectItem>
            {courses.map((course: Course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32.5">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Batch Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredBatches.map((batch: Batch) => (
          <Card key={batch.id} className="group transition-colors hover:bg-[hsl(var(--background-subtle))]">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex-1">
                <Badge variant="outline" className="mb-2">
                  {batch.course?.name || 'No Course'}
                </Badge>
                <Link to={`/batches/${batch.id}`}>
                  <CardTitle className="text-lg hover:underline">{batch.name}</CardTitle>
                </Link>
              </div>
              {isAdmin && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingBatch({ id: batch.id, name: batch.name, courseId: batch.courseId })
                        setIsEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeleteBatch(batch.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Footer */}
              <div className="flex items-center justify-between pt-2">
                <Badge variant={batch.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                  {batch.status || 'Unknown'}
                </Badge>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(batch.startDate).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredBatches.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No batches found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {searchQuery ? 'Try adjusting your search or filters.' : 'Create your first batch to get started.'}
            </p>
            {isAdmin && !searchQuery && (
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Batch
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
