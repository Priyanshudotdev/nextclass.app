import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Plus } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/empty-state/EmptyState'

export function ParentsPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <PageHeader
        title="Parents"
        subtitle="Manage parent accounts linked to your students"
        rightContent={
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Link Parent
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Parents</p>
              <p className="font-mono text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Parents</p>
              <p className="font-mono text-2xl font-semibold">0</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="py-16">
          <EmptyState
            icon={Users}
            title="No parents linked yet"
            description="Link parents to students from the student profile."
          />
        </CardContent>
      </Card>
    </div>
  )
}
