import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
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
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  BookOpen,
  Mail,
  Loader2,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { getInitials } from '@/lib/utils'
import { useTeachers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useAdmin'
import { toast } from 'sonner'
import type { User } from '@/api/admin.api'

export function TeachersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTeacher, setEditingTeacher] = useState<{ id: string; name: string; email: string } | null>(null)
  const [newTeacher, setNewTeacher] = useState({ name: '', email: '', password: '', address: '', city: '', state: '' })

  const isAdmin = user?.role === 'ADMIN'

  // React Query hooks
  const { data: teachersData, isLoading, error } = useTeachers()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const teachers = teachersData || []

  const filteredTeachers = teachers.filter((teacher: User) => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (teacher.status?.toLowerCase() ?? '') === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateTeacher = async () => {
    if (!newTeacher.name.trim() || !newTeacher.email.trim() || !newTeacher.password) {
      toast.error('Name, email and password are required')
      return
    }
    try {
      await createUserMutation.mutateAsync({
        name: newTeacher.name,
        email: newTeacher.email,
        password: newTeacher.password,
        address: newTeacher.address || 'N/A',
        city: newTeacher.city || 'N/A',
        state: newTeacher.state || 'N/A',
        role: 'TEACHER',
      })
      toast.success('Teacher created successfully')
      setIsCreateDialogOpen(false)
      setNewTeacher({ name: '', email: '', password: '', address: '', city: '', state: '' })
    } catch (err) {
      toast.error('Failed to create teacher')
    }
  }

  const handleUpdateTeacher = async () => {
    if (!editingTeacher) return
    try {
      await updateUserMutation.mutateAsync({
        userId: editingTeacher.id,
        input: {
          name: editingTeacher.name,
          email: editingTeacher.email,
        },
      })
      toast.success('Teacher updated successfully')
      setIsEditDialogOpen(false)
      setEditingTeacher(null)
    } catch (err) {
      toast.error('Failed to update teacher')
    }
  }

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!confirm('Are you sure you want to remove this teacher?')) return
    try {
      await deleteUserMutation.mutateAsync(teacherId)
      toast.success('Teacher removed successfully')
    } catch (err) {
      toast.error('Failed to remove teacher')
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
          <p className="text-destructive">Failed to load teachers</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Teachers</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage teaching staff and their assignments.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Teacher
          </Button>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Teacher</DialogTitle>
            <DialogDescription>Create a new teacher account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={newTeacher.name}
                onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newTeacher.password}
                onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={newTeacher.address}
                onChange={(e) => setNewTeacher({ ...newTeacher, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newTeacher.city}
                  onChange={(e) => setNewTeacher({ ...newTeacher, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newTeacher.state}
                  onChange={(e) => setNewTeacher({ ...newTeacher, state: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTeacher} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Teacher
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Teacher</DialogTitle>
            <DialogDescription>Update teacher details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editingTeacher?.name || ''}
                onChange={(e) => setEditingTeacher(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingTeacher?.email || ''}
                onChange={(e) => setEditingTeacher(prev => prev ? { ...prev, email: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTeacher} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Total</p>
              <p className="font-stat text-lg sm:text-2xl font-semibold">{teachers.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Active</p>
              <p className="font-stat text-lg sm:text-2xl font-semibold">
                {teachers.filter((t: User) => t.status?.toLowerCase() === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Inactive</p>
              <p className="font-stat text-lg sm:text-2xl font-semibold">
                {teachers.filter((t: User) => t.status?.toLowerCase() !== 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Teacher Cards */}
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTeachers.map((teacher: User) => (
          <Card key={teacher.id} className="group transition-colors hover:bg-[hsl(var(--background-subtle))]">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarFallback className="text-sm">{getInitials(teacher.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={`/teachers/${teacher.id}`}>
                      <h3 className="font-semibold text-sm sm:text-base hover:underline">{teacher.name}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">Teacher</p>
                  </div>
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
                          setEditingTeacher({ id: teacher.id, name: teacher.name, email: teacher.email })
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteTeacher(teacher.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="truncate">{teacher.email}</span>
                </div>
                {teacher.city && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                    {teacher.city}, {teacher.state}
                  </div>
                )}
              </div>

              <div className="mt-3 sm:mt-4 flex items-center justify-between">
                <Badge variant={teacher.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
                  {teacher.status || 'Unknown'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No teachers found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
