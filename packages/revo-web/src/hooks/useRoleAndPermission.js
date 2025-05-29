import { useContext } from 'react'
import { AuthContext } from '../components/ContextProvider'

export const Role = Object.freeze({
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  USER: 'USER',
})

export const DraftUserRole = Object.freeze({
  PROJECT_ADMIN: 'PROJECT_ADMIN',
  PROJECT_DESIGNER: 'PROJECT_DESIGNER',
  VISITOR: 'VISITOR',
})

const projectPermissionMatrix = {
  [DraftUserRole.PROJECT_ADMIN]: {
    editMembers: true,
    editProject: true,
    viewProject: true,
    exportReport: true,
  },
  [DraftUserRole.PROJECT_DESIGNER]: {
    editMembers: false,
    editProject: true,
    viewProject: true,
    exportReport: true,
  },
  [DraftUserRole.VISITOR]: {
    editMembers: false,
    editProject: false,
    viewProject: true,
    exportReport: true,
  },
}

/**
 * A hook to check both global and project-specific permissions.
 * @returns {{
 *   canCreateProject: boolean,
 *   canAssignProjectAdmin: boolean,
 *   hasPermission: function( 'canCURDUser' | 'createProject' | 'assignProjectAdmin' | 'editMembers' | 'editProject' | 'viewProject' | 'exportReport', projectRole: 'PROJECT_ADMIN' | 'PROJECT_DESIGNER' | 'VISITOR'): boolean
 * }}
 */
export function usePermissions() {
  const { auth } = useContext(AuthContext)

  // Global permissions granted only to SYSTEM_ADMIN
  const canCreateProject = auth.role === Role.SYSTEM_ADMIN
  const canAssignProjectAdmin = auth.role === Role.SYSTEM_ADMIN
  const canCURDUser = auth.role === Role.SYSTEM_ADMIN

  return {
    canCreateProject,
    canAssignProjectAdmin,
    canCURDUser,
    hasPermission: (action, projectRole) => {
      if (action === 'createProject') return canCreateProject
      if (action === 'assignProjectAdmin') return canAssignProjectAdmin
      if (action === 'canCURDUser') return canCURDUser

      // For project-specific permissions, projectRole is required
      if (!projectRole) {
        return false
      }

      const projectPerms = projectPermissionMatrix[projectRole] || {}
      return Boolean(projectPerms[action])
    },
  }
}
