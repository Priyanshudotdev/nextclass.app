import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/api/auth.api'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

const ROLE_FALLBACK: Record<UserRole, string> = {
  ADMIN: '/dashboard',
  TEACHER: '/teacher/dashboard',
  STUDENT: '/student/dashboard',
  PARENT: '/parent/dashboard',
}

export const RoleGuard = ({ allowedRoles }: RoleGuardProps) => {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    const fallback = user ? ROLE_FALLBACK[user.role] : '/login'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
