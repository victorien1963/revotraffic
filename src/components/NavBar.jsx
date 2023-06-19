import React from 'react'
import PropTypes from 'prop-types'
import { Container, Navbar, Image, Button } from 'react-bootstrap'
import { RTLogo2 } from '../assets'

function NavBar({ setting }) {
  const { handleLogout } = setting

  return (
    <Navbar className="bg-revo2 p-0">
      <Container fluid className="px-4">
        <Navbar.Brand className="d-flex" href="#home" title="回首頁">
          <Image
            src={RTLogo2}
            className="m-auto pe-2"
            style={{ width: '3.5rem' }}
          />
          <div className="fw-bolder my-auto text-light fs-5">RevoTraffic</div>
        </Navbar.Brand>
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
      </Container>
    </Navbar>
  )
}

NavBar.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default NavBar
