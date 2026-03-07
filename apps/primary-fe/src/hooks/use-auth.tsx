import { createContext, useContext, useCallback, type ReactNode } from 'react'
import { useCurrentUser } from '@/hooks/auth/useCurrentUser'
import { useLogout } from '@/hooks/auth/useLogout'
import type { User, UserRole } from '@/api/auth.api'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => void
  hasRole: (roles: UserRole | UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useCurrentUser()
  const logoutMutation = useLogout()

  const hasRole = useCallback(
    (roles: UserRole | UserRole[]) => {
      if (!user) return false
      const roleArray = Array.isArray(roles) ? roles : [roles]
      return roleArray.includes(user.role)
    },
    [user]
  )

  const logout = useCallback(() => {
    logoutMutation.mutate()
  }, [logoutMutation])

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isAuthenticated: !!user,
        isLoading,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Role-based component wrapper
export function RequireRole({
  children,
  roles,
  fallback = null,
}: {
  children: ReactNode
  roles: UserRole | UserRole[]
  fallback?: ReactNode
}) {
  const { hasRole, isLoading } = useAuth()

  if (isLoading) return null
  if (!hasRole(roles)) return fallback

  return <>{children}</>
}
