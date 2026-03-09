import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Pencil,
  UserX,
  UserMinus,
  Layers,
  Users,
  FolderOpen,
  Clock,
  Upload,
  AlertCircle,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { getInitials } from '@/lib/utils'
import { useTeachers, useBatches, useResources } from '@/hooks/useAdmin'

export function TeacherDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('batches')

  // Fetch real data
  const { data: teachers, isLoading: teachersLoading } = useTeachers()
  const { data: allBatches } = useBatches({})
  const { data: resources } = useResources({})

  // Find the specific teacher
  const teacher = teachers?.find(t => t.id === id)

  // Filter resources by this teacher (when we have uploadedBy field)
  const teacherResources = resources || []

  // Loading state
  if (teachersLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-2 h-4 w-32" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Not found state
  if (!teacher) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Teacher Not Found</h2>
        <p className="text-muted-foreground">The teacher you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/teachers">Back to Teachers</Link>
        </Button>
      </div>
    )
  }

  // Get assigned batches (would need teacher-batch relation in real API)
  const assignedBatches = allBatches || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        backLink="/teachers"
        backLabel="Back to Teachers"
        rightContent={
          <>
            <Badge>{teacher.status}</Badge>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Teacher
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <UserX className="mr-2 h-4 w-4" />
                  Suspend
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <UserMinus className="mr-2 h-4 w-4" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Profile Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">{getInitials(teacher.name)}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-semibold">{teacher.name}</h1>
          <p className="text-sm text-muted-foreground">
            Teacher
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Assigned Batches</p>
              <p className="font-mono text-2xl font-semibold">{assignedBatches.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="font-mono text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <FolderOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resources Uploaded</p>
              <p className="font-mono text-2xl font-semibold">{teacherResources.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Joined</p>
              <p className="font-mono text-2xl font-semibold">
                {new Date(teacher.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Profile */}
        <Card className="lg:col-span-1">
          <CardContent className="space-y-6 p-5">
            {/* Personal Info */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Personal Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium">—</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="text-sm font-medium">{teacher.email || '—'}</span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Specialization */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Specialization</h3>
              <p className="text-sm text-muted-foreground">Not specified</p>
            </div>

            <div className="h-px bg-border" />

            {/* Assigned Batches Summary */}
            <div>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">Assigned Batches</h3>
              {assignedBatches.length > 0 ? (
                <div className="space-y-3">
                  {assignedBatches.slice(0, 3).map((batch) => (
                    <Link key={batch.id} to={`/batches/${batch.id}`} className="block rounded-lg border p-3 transition-colors hover:bg-muted/50">
                      <p className="text-sm font-medium">{batch.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {batch.course?.name || 'Course'}
                      </p>
                    </Link>
                  ))}
                  {assignedBatches.length > 3 && (
                    <p className="text-xs text-muted-foreground">+{assignedBatches.length - 3} more batches</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No batches assigned.</p>
              )}
              <Button variant="link" size="sm" className="mt-2 h-auto p-0">
                Manage Assignments
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Tabs */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="batches">Batches</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Batches Tab */}
            <TabsContent value="batches" className="mt-6">
              {assignedBatches.length > 0 ? (
                <Card>
                  <CardContent className="overflow-x-auto p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch</TableHead>
                          <TableHead>Course</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {assignedBatches.map((batch) => (
                          <TableRow key={batch.id}>
                            <TableCell>
                              <Link to={`/batches/${batch.id}`} className="font-medium hover:underline">
                                {batch.name}
                              </Link>
                            </TableCell>
                            <TableCell className="text-muted-foreground">{batch.course?.name || '—'}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{batch.status}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Layers className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No Batches Assigned</h3>
                    <p className="text-sm text-muted-foreground">This teacher has not been assigned to any batches yet.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Recent uploads</span>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resource
                </Button>
              </div>
              {teacherResources.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teacherResources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell className="font-medium">{resource.title}</TableCell>
                            <TableCell className="text-muted-foreground">{resource.fileType || 'File'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FolderOpen className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 font-semibold">No Resources</h3>
                    <p className="text-sm text-muted-foreground">No resources have been uploaded yet.</p>
                    <Button className="mt-4" size="sm">
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Resource
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-sm text-muted-foreground py-8">No recent activity.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
