import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Users,
  Layers,
  BookOpen,
  Calendar,
  AlertCircle,
  Plus,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useCourses, useBatches, useSubjects, useEnrollments, useCreateSubject, useDeleteSubject } from '@/hooks/useAdmin'

export function CourseDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [activeTab, setActiveTab] = useState('overview')
  const [addSubjectOpen, setAddSubjectOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')

  // Fetch real data
  const { data: courses, isLoading: coursesLoading } = useCourses()
  const { data: allBatches, isLoading: batchesLoading } = useBatches({ courseId: id })
  const { data: allSubjects, isLoading: subjectsLoading } = useSubjects()
  const { data: allEnrollments } = useEnrollments()

  // Mutations
  const createSubjectMutation = useCreateSubject()
  const deleteSubjectMutation = useDeleteSubject()

  // Find the specific course
  const course = courses?.find(c => c.id === id)
  
  // Filter data for this course
  const batches = allBatches || []
  const subjects = allSubjects?.filter(s => s.courseId === id) || []
  
  // Calculate stats from real data
  const totalStudents = allEnrollments?.filter(e => 
    batches.some(b => b.id === e.batch.id)
  ).length || 0

  // Handlers
  const handleAddSubject = async () => {
    if (!newSubjectName.trim() || !id) return
    await createSubjectMutation.mutateAsync({
      courseId: id,
      name: newSubjectName.trim(),
    })
    setNewSubjectName('')
    setAddSubjectOpen(false)
  }

  const handleDeleteSubject = async (subjectId: string) => {
    if (confirm('Are you sure you want to delete this subject?')) {
      await deleteSubjectMutation.mutateAsync(subjectId)
    }
  }

  // Loading state
  if (coursesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12 w-96" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Not found state
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Course Not Found</h2>
        <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link to="/courses">Back to Courses</Link>
        </Button>
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        backLink="/courses"
        backLabel="Back to Courses"
        badge={<Badge variant="outline">{course.status}</Badge>}
        title={course.name}
        subtitle={`${formatDate(course.startDate)}${course.endDate ? ` – ${formatDate(course.endDate)}` : ''}`}
        rightContent={
          <>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Course
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Archive className="mr-2 h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {/* Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Layers className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Batches</p>
              <p className="font-mono text-2xl font-semibold">{batches.length}</p>
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
              <p className="font-mono text-2xl font-semibold">{totalStudents}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Subjects</p>
              <p className="font-mono text-2xl font-semibold">{subjects.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="font-mono text-2xl font-semibold">
                {course.endDate 
                  ? Math.ceil((new Date(course.endDate).getTime() - new Date(course.startDate).getTime()) / (1000 * 60 * 60 * 24 * 30)) + ' mo'
                  : 'Ongoing'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subjects">Subjects</TabsTrigger>
          <TabsTrigger value="batches">Batches</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {course.description ? (
                <p className="text-sm text-muted-foreground">{course.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No description added.</p>
              )}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Subjects ({subjects.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {subjects.length > 0 ? (
                  <div className="space-y-3">
                    {subjects.slice(0, 5).map((subject) => (
                      <div key={subject.id} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-medium">{subject.name}</span>
                      </div>
                    ))}
                    {subjects.length > 5 && (
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab('subjects')}>
                        View all {subjects.length} subjects
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No subjects added yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-medium">Batches ({batches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {batches.length > 0 ? (
                  <div className="space-y-3">
                    {batches.slice(0, 5).map((batch) => (
                      <Link
                        key={batch.id}
                        to={`/batches/${batch.id}`}
                        className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50"
                      >
                        <div>
                          <span className="font-medium">{batch.name}</span>
                          <Badge variant="outline" className="ml-2">{batch.status}</Badge>
                        </div>
                      </Link>
                    ))}
                    {batches.length > 5 && (
                      <Button variant="ghost" className="w-full" onClick={() => setActiveTab('batches')}>
                        View all {batches.length} batches
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No batches created yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subjects Tab */}
        <TabsContent value="subjects" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Subjects ({subjects.length})</h3>
            <Dialog open={addSubjectOpen} onOpenChange={setAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Subject</DialogTitle>
                  <DialogDescription>
                    Add a new subject to this course. Subjects can be assigned to specific batches later.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="subjectName">Subject Name</Label>
                    <Input
                      id="subjectName"
                      placeholder="e.g., Mathematics, Physics, English"
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddSubject()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setAddSubjectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddSubject} disabled={!newSubjectName.trim() || createSubjectMutation.isPending}>
                    {createSubjectMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add Subject
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {subjectsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : subjects.length > 0 ? (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <Card key={subject.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-medium">{subject.name}</h3>
                      <p className="text-sm text-muted-foreground">Course: {subject.course.name}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteSubject(subject.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No Subjects</h3>
                <p className="text-sm text-muted-foreground">No subjects have been added to this course yet.</p>
                <Button className="mt-4" onClick={() => setAddSubjectOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Subject
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Batches Tab */}
        <TabsContent value="batches" className="space-y-4">
          {batchesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : batches.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {batches.map((batch) => (
                <Link key={batch.id} to={`/batches/${batch.id}`}>
                  <Card className="transition-colors hover:bg-muted/50">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{batch.name}</h3>
                          <p className="text-sm text-muted-foreground">{batch.description || 'No description'}</p>
                        </div>
                        <Badge variant="outline">{batch.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layers className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 font-semibold">No Batches</h3>
                <p className="text-sm text-muted-foreground">No batches have been created for this course yet.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
