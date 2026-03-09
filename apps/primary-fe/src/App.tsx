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
import { CoursesPage, CourseDetailsPage } from '@/app/pages/courses'
import { BatchesPage, BatchDetailsPage } from '@/app/pages/batches'
import { StudentsPage, StudentDetailsPage } from '@/app/pages/students'
import { TeachersPage, TeacherDetailsPage } from '@/app/pages/teachers'
import { ParentsPage } from '@/app/pages/parents'
import { AttendancePage } from '@/app/pages/attendance'
import { ResourcesPage } from '@/app/pages/resources'
import { AnnouncementsPage } from '@/app/pages/announcements'
import { ChatPage } from '@/app/pages/chat'
import { ReportsPage } from '@/app/pages/reports'
import { SettingsPage } from '@/app/pages/settings'
import {
  ChildLayout,
  ChildProfilePage,
  ChildAttendancePage,
  ChildResourcesPage,
  ChildSchedulePage,
} from '@/app/pages/parent/children'

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
              <Route path="/courses/:id" element={<CourseDetailsPage />} />
              <Route path="/batches" element={<BatchesPage />} />
              <Route path="/batches/:id" element={<BatchDetailsPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/students/:id" element={<StudentDetailsPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/teachers/:id" element={<TeacherDetailsPage />} />
              <Route path="/parents" element={<ParentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/announcements" element={<AnnouncementsPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              {/* Child routes for parents */}
              <Route path="/children/:id" element={<ChildLayout />}>
                <Route index element={<ChildProfilePage />} />
                <Route path="attendance" element={<ChildAttendancePage />} />
                <Route path="resources" element={<ChildResourcesPage />} />
                <Route path="schedule" element={<ChildSchedulePage />} />
              </Route>
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
