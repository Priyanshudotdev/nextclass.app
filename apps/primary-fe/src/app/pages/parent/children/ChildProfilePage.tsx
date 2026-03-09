import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { getInitials } from '@/lib/utils'

interface ContextType {
  child: { id: string; name: string; batch: string; rollNo: string; grade: string }
}

// Extended mock data
const childDetails = {
  c1: {
    phone: '+91 98765 43210',
    email: 'ankit.sharma@email.com',
    address: '123 Main Street, Nagpur, Maharashtra',
    dateOfBirth: '2008-05-15',
    joinedOn: '2024-06-01',
    bloodGroup: 'B+',
    emergencyContact: '+91 98765 12345',
    subjects: ['Physics', 'Chemistry', 'Biology', 'English'],
    teachers: [
      { name: 'Rahul Sir', subject: 'Physics' },
      { name: 'Mehta Sir', subject: 'Chemistry' },
      { name: 'Priya Ma\'am', subject: 'Biology' },
    ],
  },
  c2: {
    phone: '+91 98765 43211',
    email: 'priya.sharma@email.com',
    address: '123 Main Street, Nagpur, Maharashtra',
    dateOfBirth: '2010-08-22',
    joinedOn: '2025-01-15',
    bloodGroup: 'O+',
    emergencyContact: '+91 98765 12345',
    subjects: ['Math', 'Science', 'English', 'Social Studies'],
    teachers: [
      { name: 'Sharma Sir', subject: 'Math' },
      { name: 'Verma Ma\'am', subject: 'Science' },
    ],
  },
}

export function ChildProfilePage() {
  const { child } = useOutletContext<ContextType>()
  const details = childDetails[child.id as keyof typeof childDetails] || childDetails.c1

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Personal Info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-medium">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{details.phone}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{details.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(details.dateOfBirth)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                <User className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Blood Group</p>
                <p className="font-medium">{details.bloodGroup}</p>
              </div>
            </div>
          </div>
          <div className="flex items-start gap-3 border-t pt-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">{details.address}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Quick Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Batch</span>
            <Badge variant="outline">{child.batch}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Roll Number</span>
            <span className="font-mono font-medium">{child.rollNo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Joined On</span>
            <span className="font-medium">{formatDate(details.joinedOn)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Emergency Contact</span>
            <span className="font-medium">{details.emergencyContact}</span>
          </div>
        </CardContent>
      </Card>

      {/* Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {details.subjects.map((subject) => (
              <Badge key={subject} variant="secondary">
                {subject}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Teachers */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base font-medium">Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {details.teachers.map((teacher) => (
              <div key={teacher.name} className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>{getInitials(teacher.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{teacher.name}</p>
                  <p className="text-sm text-muted-foreground">{teacher.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
