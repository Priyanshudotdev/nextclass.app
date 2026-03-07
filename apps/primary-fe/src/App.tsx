import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/app/layout/AppLayout'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { TooltipProvider } from '@/components/ui/tooltip'
import {
  AdminDashboard,
  TeacherDashboard,
  StudentDashboard,
  ParentDashboard,
} from '@/app/pages/dashboard'
import { LoginPage, RegisterPage, OnboardingPage, ForgotPasswordPage } from '@/app/pages/auth'
import { CoursesPage } from '@/app/pages/courses'
import { BatchesPage } from '@/app/pages/batches'
import { StudentsPage } from '@/app/pages/students'
import { TeachersPage } from '@/app/pages/teachers'
import { AttendancePage } from '@/app/pages/attendance'
import { ResourcesPage } from '@/app/pages/resources'
import { SettingsPage } from '@/app/pages/settings'

function DashboardRouter() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  switch (user.role) {
    case 'ADMIN':
      return <AdminDashboard />
    case 'TEACHER':
      return <TeacherDashboard />
    case 'STUDENT':
      return <StudentDashboard />
    case 'PARENT':
      return <ParentDashboard />
    default:
      return <Navigate to="/login" replace />
  }
}

// Placeholder components for routes
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
      <p className="text-muted-foreground">This page is under construction.</p>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <TooltipProvider>
          <Routes>
            {/* Auth routes (no layout) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected routes with layout */}
            <Route element={<AppLayout />}>
              <Route path="/" element={<DashboardRouter />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:id" element={<PlaceholderPage title="Course Details" />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/batches/:id" element={<PlaceholderPage title="Batch Details" />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<PlaceholderPage title="Student Details" />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/teachers/:id" element={<PlaceholderPage title="Teacher Details" />} />
              <Route path="/parents" element={<PlaceholderPage title="Parents" />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/announcements" element={<PlaceholderPage title="Announcements" />} />
              <Route path="/chat" element={<PlaceholderPage title="Chat" />} />
              <Route path="/reports" element={<PlaceholderPage title="Reports" />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/children/:id" element={<PlaceholderPage title="Child Profile" />} />
              <Route path="/children/:id/attendance" element={<PlaceholderPage title="Child Attendance" />} />
              <Route path="/children/:id/resources" element={<PlaceholderPage title="Child Resources" />} />
              <Route path="/children/:id/schedule" element={<PlaceholderPage title="Child Schedule" />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
