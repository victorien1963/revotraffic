import { useCallback, useContext } from 'react'
import { AuthContext } from '../components/ContextProvider'

export const Role = Object.freeze({
  PROJECT_ADMIN: 'PROJECT_ADMIN',
  PROJECT_DESIGNER: 'PROJECT_DESIGNER',
  VISITOR: 'VISITOR',
  SUPER_ADMIN: 'SUPER_ADMIN',
})

export default function useRoleAndPermission() {
  const { auth: user } = useContext(AuthContext)

  const checkPermission = useCallback(
    (permissions) =>
      user.role === Role.SUPER_ADMIN || permissions.includes(user.role),
    [user.role]
  )

  return { checkPermission }
}
