import React, { useCallback, useContext } from 'react'
import { Container, Navbar, Image, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { RTLogo2 } from '../assets'
import { AuthContext } from './ContextProvider'
import useRoleAndPermission, { Role } from '../hooks/useRoleAndPermission'

function NavBar() {
  const { setAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const { checkPermission } = useRoleAndPermission()

  const handleLogout = () => {
    document.cookie = `token=; Domain=${window.location.hostname}; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    setAuth({
      authed: false,
    })
  }

  const handleUserManagement = useCallback(() => {
    navigate('/User')
  }, [])

  return (
    <Navbar className="bg-revo2 p-0">
      <Container fluid className="px-4">
        <Navbar.Brand className="d-flex" href="/Home" title="回首頁">
          <Image
            src={RTLogo2}
            className="m-auto pe-2"
            style={{ width: '3.5rem' }}
          />
          <div className="fw-bolder my-auto text-light fs-5">RevoTraffic</div>
        </Navbar.Brand>

        <div>
          {checkPermission([Role.SUPER_ADMIN]) && (
            <Button
              className="fw-bolder my-auto"
              style={{ cursor: 'pointer', marginRight: '1rem' }}
              size="sm"
              variant="outline-light"
              title="用 戶 管 理"
              onClick={handleUserManagement}
            >
              用 戶 管 理
            </Button>
          )}

          <Button
            className="fw-bolder my-auto"
            style={{ cursor: 'pointer' }}
            size="sm"
            variant="outline-light"
            title="登出"
            onClick={handleLogout}
          >
            登 出
          </Button>
        </div>
      </Container>
    </Navbar>
  )
}

export default NavBar
