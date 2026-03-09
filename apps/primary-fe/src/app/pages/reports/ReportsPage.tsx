import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Download, BarChart2, Users, FileText } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { useBatches, useStudents, useEnrollments, useAttendance } from '@/hooks/useAdmin'

export function ReportsPage() {
  const [batchFilter, setBatchFilter] = useState('all')
  const [dateRange, setDateRange] = useState('last-6-months')

  // Fetch real data
  const { data: batches } = useBatches({})
  const { data: students } = useStudents()
  const { data: enrollments } = useEnrollments()
  const { data: attendance } = useAttendance({})

  // Calculate real stats
  const totalStudents = students?.length || 0
  const activeStudents = students?.filter(s => s.status === 'ACTIVE').length || 0
  const totalEnrollments = enrollments?.length || 0
  const attendanceRecords = attendance?.length || 0
  const presentCount = attendance?.filter(a => a.status === 'PRESENT').length || 0
  const overallAttendance = attendanceRecords > 0 ? Math.round((presentCount / attendanceRecords) * 100) : 0

  const handleExport = (reportType: string) => {
    console.log('Export report:', reportType)
  }

  const dateRanges = [
    { id: 'this-month', name: 'This Month' },
    { id: 'last-month', name: 'Last Month' },
    { id: 'last-3-months', name: 'Last 3 Months' },
    { id: 'last-6-months', name: 'Last 6 Months' },
    { id: 'this-year', name: 'This Year' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader title="Reports" />

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
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
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            {dateRanges.map((range) => (
              <SelectItem key={range.id} value={range.id}>
                {range.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                    <p className="font-mono text-3xl font-semibold">{totalStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <Users className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active Students</p>
                    <p className="font-mono text-3xl font-semibold">{activeStudents}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="font-mono text-3xl font-semibold">{totalEnrollments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    <BarChart2 className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Attendance</p>
                    <p className="font-mono text-3xl font-semibold">{overallAttendance}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Summary</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('summary')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {totalStudents > 0 || totalEnrollments > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You have {totalStudents} registered students with {totalEnrollments} active enrollments.
                    The overall attendance rate is {overallAttendance}%.
                  </p>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No data available yet. Add students and batches to see reports.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Attendance Overview</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('attendance')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {attendanceRecords > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold">{attendanceRecords}</p>
                    <p className="text-sm text-muted-foreground">Total Records</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold text-success">{presentCount}</p>
                    <p className="text-sm text-muted-foreground">Present</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold">{overallAttendance}%</p>
                    <p className="text-sm text-muted-foreground">Attendance Rate</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No attendance data available yet. Mark attendance to see reports.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-medium">Enrollment Overview</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport('enrollment')}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              {totalEnrollments > 0 ? (
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold">{totalEnrollments}</p>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold">{batches?.length || 0}</p>
                    <p className="text-sm text-muted-foreground">Active Batches</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="font-mono text-3xl font-bold">{totalStudents}</p>
                    <p className="text-sm text-muted-foreground">Total Students</p>
                  </div>
                </div>
              ) : (
                <p className="text-center text-sm text-muted-foreground py-8">
                  No enrollment data available yet. Enroll students in batches to see reports.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <BarChart2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Performance Reports Coming Soon</h3>
              <p className="mt-2 max-w-md text-center text-muted-foreground">
                Performance analytics with test scores, grade distributions, and improvement tracking
                will be available in version 2.0.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
