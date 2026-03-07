import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Users, GraduationCap, ArrowRight, Check, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OnboardingTask {
  id: string
  title: string
  description: string
  icon: React.ElementType
  route: string
  completed: boolean
}

export function OnboardingPage() {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState<OnboardingTask[]>([
    {
      id: 'course',
      title: 'Create Your First Course',
      description: 'Set up JEE/NEET courses with subjects and batches',
      icon: BookOpen,
      route: '/courses',
      completed: false,
    },
    {
      id: 'teachers',
      title: 'Add Teachers',
      description: 'Invite faculty members to join your institute',
      icon: Users,
      route: '/teachers',
      completed: false,
    },
    {
      id: 'students',
      title: 'Add Students',
      description: 'Enroll students and assign them to batches',
      icon: GraduationCap,
      route: '/students',
      completed: false,
    },
  ])

  const completedCount = tasks.filter((t) => t.completed).length
  const allCompleted = completedCount === tasks.length

  const handleTaskClick = (task: OnboardingTask) => {
    // Mark as completed when clicked
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
    )
    navigate(task.route)
  }

  const handleSkip = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <h1 className="font-display text-xl font-semibold">NextClass</h1>
          <Button variant="ghost" onClick={handleSkip}>
            Skip for now
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto max-w-2xl px-4 py-16">
        <div className="space-y-8">
          {/* Welcome Header */}
          <div className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-foreground text-background">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="font-display text-3xl font-semibold">
              Welcome to NextClass!
            </h2>
            <p className="mx-auto max-w-md text-muted-foreground">
              Let's get your institute set up. Complete these quick tasks to start managing your coaching center.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Setup Progress</span>
              <span className="font-medium">{completedCount} of {tasks.length} complete</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${(completedCount / tasks.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Task Cards */}
          <div className="space-y-3">
            {tasks.map((task, index) => {
              const Icon = task.icon

              return (
                <button
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={cn(
                    'group flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-foreground/20 hover:bg-muted/50',
                    task.completed && 'bg-muted/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-lg transition-colors',
                      task.completed
                        ? 'bg-foreground text-background'
                        : 'bg-muted group-hover:bg-foreground/10'
                    )}
                  >
                    {task.completed ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        STEP {index + 1}
                      </span>
                      {task.completed && (
                        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-xs font-medium">
                          Completed
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {task.description}
                    </p>
                  </div>

                  <ArrowRight className="h-5 w-5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )
            })}
          </div>

          {/* All Complete Message */}
          {allCompleted && (
            <div className="rounded-xl border border-foreground/10 bg-foreground/5 p-6 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-background">
                <Check className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                You're all set!
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your institute is ready. Head to your dashboard to get started.
              </p>
              <Button className="mt-4" onClick={() => navigate('/')}>
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Help Link */}
          <p className="text-center text-sm text-muted-foreground">
            Need help?{' '}
            <a href="#" className="text-foreground underline hover:no-underline">
              Read our setup guide
            </a>{' '}
            or{' '}
            <a href="#" className="text-foreground underline hover:no-underline">
              contact support
            </a>
          </p>
        </div>
      </main>
    </div>
  )
}
