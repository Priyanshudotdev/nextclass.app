import { useOutletContext } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResourceBrowser } from '@/components/shared/ResourceBrowser'

interface ContextType {
  child: { id: string; name: string; batch: string; rollNo: string; grade: string }
}

const mockResources = {
  c1: {
    subjects: [
      {
        id: 's1',
        name: 'Physics',
        units: [
          {
            id: 'u1',
            name: 'Mechanics',
            files: [
              { id: 'f1', title: 'Mechanics Notes.pdf', type: 'PDF' as const, size: '2.4 MB', uploadedBy: 'Rahul Sir', uploadedAt: '2026-03-05', url: '#' },
              { id: 'f2', title: 'Wave Optics.pdf', type: 'PDF' as const, size: '1.8 MB', uploadedBy: 'Rahul Sir', uploadedAt: '2026-03-03', url: '#' },
            ],
          },
        ],
      },
      {
        id: 's2',
        name: 'Chemistry',
        units: [
          {
            id: 'u2',
            name: 'Organic Chemistry',
            files: [
              { id: 'f3', title: 'Organic Chemistry.pdf', type: 'PDF' as const, size: '3.2 MB', uploadedBy: 'Mehta Sir', uploadedAt: '2026-03-04', url: '#' },
              { id: 'f4', title: 'Atomic Structure Video', type: 'VIDEO' as const, size: '5.1 MB', uploadedBy: 'Mehta Sir', uploadedAt: '2026-03-02', url: '#' },
            ],
          },
        ],
      },
      {
        id: 's3',
        name: 'Biology',
        units: [
          {
            id: 'u3',
            name: 'Cell Biology',
            files: [
              { id: 'f5', title: 'Cell Biology.pdf', type: 'PDF' as const, size: '4.5 MB', uploadedBy: 'Priya Ma\'am', uploadedAt: '2026-03-01', url: '#' },
            ],
          },
        ],
      },
    ],
  },
  c2: {
    subjects: [
      {
        id: 's1',
        name: 'Mathematics',
        units: [
          {
            id: 'u1',
            name: 'Algebra',
            files: [
              { id: 'f1', title: 'Algebra Notes.pdf', type: 'PDF' as const, size: '1.8 MB', uploadedBy: 'Sharma Sir', uploadedAt: '2026-03-05', url: '#' },
              { id: 'f2', title: 'Geometry Problems.pdf', type: 'PDF' as const, size: '2.1 MB', uploadedBy: 'Sharma Sir', uploadedAt: '2026-03-03', url: '#' },
            ],
          },
        ],
      },
      {
        id: 's2',
        name: 'Science',
        units: [
          {
            id: 'u2',
            name: 'Physics Basics',
            files: [
              { id: 'f3', title: 'Physics Basics.pdf', type: 'PDF' as const, size: '2.5 MB', uploadedBy: 'Verma Ma\'am', uploadedAt: '2026-03-04', url: '#' },
            ],
          },
        ],
      },
    ],
  },
}

export function ChildResourcesPage() {
  const { child } = useOutletContext<ContextType>()
  const resources = mockResources[child.id as keyof typeof mockResources] || mockResources.c1

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">Study Materials</CardTitle>
      </CardHeader>
      <CardContent>
        <ResourceBrowser subjects={resources.subjects} readOnly />
      </CardContent>
    </Card>
  )
}
