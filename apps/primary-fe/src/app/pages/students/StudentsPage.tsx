import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  type SortingState,
  getFilteredRowModel,
  type ColumnFiltersState,
} from '@tanstack/react-table'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Plus,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  ArrowUpDown,
  Download,
  Mail,
  Loader2,
  MapPin,
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useIsMobile } from '@/hooks/use-sidebar'
import { getInitials } from '@/lib/utils'
import { useStudents, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useAdmin'
import { MobileDataCard, MobileDataCardList, MobileDataCardSkeleton } from '@/components/tables/MobileDataCard'
import { toast } from 'sonner'
import type { User } from '@/api/admin.api'

export function StudentsPage() {
  const { user } = useAuth()
  const isMobile = useIsMobile()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<{ id: string; name: string; email: string } | null>(null)
  const [newStudent, setNewStudent] = useState({ name: '', email: '', password: '', address: '', city: '', state: '' })

  const isAdmin = user?.role === 'ADMIN'

  // React Query hooks
  const { data: studentsData, isLoading, error } = useStudents()
  const createUserMutation = useCreateUser()
  const updateUserMutation = useUpdateUser()
  const deleteUserMutation = useDeleteUser()

  const students = studentsData || []

  const filteredData = statusFilter === 'all'
    ? students
    : students.filter((s: User) => s.status?.toLowerCase() === statusFilter)

  const handleCreateStudent = async () => {
    if (!newStudent.name.trim() || !newStudent.email.trim() || !newStudent.password) {
      toast.error('Name, email and password are required')
      return
    }
    try {
      await createUserMutation.mutateAsync({
        name: newStudent.name,
        email: newStudent.email,
        password: newStudent.password,
        address: newStudent.address || 'N/A',
        city: newStudent.city || 'N/A',
        state: newStudent.state || 'N/A',
        role: 'STUDENT',
      })
      toast.success('Student created successfully')
      setIsCreateDialogOpen(false)
      setNewStudent({ name: '', email: '', password: '', address: '', city: '', state: '' })
    } catch (err) {
      toast.error('Failed to create student')
    }
  }

  const handleUpdateStudent = async () => {
    if (!editingStudent) return
    try {
      await updateUserMutation.mutateAsync({
        userId: editingStudent.id,
        input: {
          name: editingStudent.name,
          email: editingStudent.email,
        },
      })
      toast.success('Student updated successfully')
      setIsEditDialogOpen(false)
      setEditingStudent(null)
    } catch (err) {
      toast.error('Failed to update student')
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return
    try {
      await deleteUserMutation.mutateAsync(studentId)
      toast.success('Student removed successfully')
    } catch (err) {
      toast.error('Failed to remove student')
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="-ml-4"
        >
          Student
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link to={`/students/${row.original.id}`} className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">{getInitials(row.getValue('name'))}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium hover:underline">{row.getValue('name')}</p>
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </Link>
      ),
    },
    {
      accessorKey: 'city',
      header: 'City',
      cell: ({ row }) => row.original.city || '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status?.toLowerCase() === 'active' ? 'default' : 'secondary'}>
          {row.original.status || 'Unknown'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/students/${row.original.id}`}>View Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </DropdownMenuItem>
            {isAdmin && (
              <>
                <DropdownMenuItem
                  onClick={() => {
                    setEditingStudent({ id: row.original.id, name: row.original.name, email: row.original.email })
                    setIsEditDialogOpen(true)
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => handleDeleteStudent(row.original.id)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      rowSelection,
    },
  })

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
          <p className="text-destructive">Failed to load students</p>
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
          <h1 className="text-xl sm:text-2xl font-semibold">Students</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage enrolled students across all batches.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {isAdmin && (
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>Create a new student account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g., John Doe"
                value={newStudent.name}
                onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="e.g., john@example.com"
                value={newStudent.email}
                onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                placeholder="Street address"
                value={newStudent.address}
                onChange={(e) => setNewStudent({ ...newStudent, address: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  value={newStudent.city}
                  onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="State"
                  value={newStudent.state}
                  onChange={(e) => setNewStudent({ ...newStudent, state: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateStudent} disabled={createUserMutation.isPending}>
              {createUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Student
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>Update student details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editingStudent?.name || ''}
                onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingStudent?.email || ''}
                onChange={(e) => setEditingStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateStudent} disabled={updateUserMutation.isPending}>
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
              <p className="font-stat text-lg sm:text-2xl font-semibold">{students.length}</p>
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
                {students.filter((s: User) => s.status?.toLowerCase() === 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-[hsl(var(--background-muted))]">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Inactive</p>
              <p className="font-stat text-lg sm:text-2xl font-semibold">
                {students.filter((s: User) => s.status?.toLowerCase() !== 'active').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Filters & Data */}
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name..."
              value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
              onChange={(e) => table.getColumn('name')?.setFilterValue(e.target.value)}
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

        {!isMobile && Object.keys(rowSelection).length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {Object.keys(rowSelection).length} selected
            <Button variant="ghost" size="sm">
              <Mail className="mr-2 h-4 w-4" />
              Send Email
            </Button>
          </div>
        )}

        {/* Mobile Card View */}
        {isMobile ? (
          <MobileDataCardList>
            {filteredData.length > 0 ? (
              filteredData.map((student: User) => (
                <MobileDataCard
                  key={student.id}
                  initials={getInitials(student.name)}
                  title={student.name}
                  subtitle={student.email}
                  href={`/students/${student.id}`}
                  status={{
                    label: student.status || 'Unknown',
                    variant: student.status?.toLowerCase() === 'active' ? 'default' : 'secondary',
                  }}
                  metadata={student.city ? [
                    { value: `${student.city}${student.state ? `, ${student.state}` : ''}`, icon: <MapPin /> }
                  ] : undefined}
                  actions={isAdmin ? [
                    { label: 'View Profile', href: `/students/${student.id}` },
                    { label: 'Send Email', icon: <Mail />, onClick: () => {} },
                    {
                      label: 'Edit',
                      icon: <Pencil />,
                      onClick: () => {
                        setEditingStudent({ id: student.id, name: student.name, email: student.email })
                        setIsEditDialogOpen(true)
                      },
                    },
                    {
                      label: 'Remove',
                      icon: <Trash2 />,
                      variant: 'destructive',
                      onClick: () => handleDeleteStudent(student.id),
                    },
                  ] : [
                    { label: 'View Profile', href: `/students/${student.id}` },
                    { label: 'Send Email', icon: <Mail />, onClick: () => {} },
                  ]}
                  showActions={true}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-sm text-muted-foreground">No students found.</p>
              </div>
            )}
          </MobileDataCardList>
        ) : (
          /* Desktop Table View */
          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
