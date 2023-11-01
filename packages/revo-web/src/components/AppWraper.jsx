import React, { useEffect, useMemo, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import NavBar from './NavBar'
import { AuthContext } from './ContextProvider'
// import Loading from './Loading'

function AppWrapper({ children }) {
  const { auth } = useContext(AuthContext)
  const location = useLocation()
  const navigate = useNavigate()

  const isHome = useMemo(() => location.pathname === '/', [location])
  useEffect(() => {
    if (!auth.authed && !isHome) {
      navigate('/')
    }
    if (auth.authed && isHome) {
      navigate('/Home')
    }
  }, [auth, isHome])

  return auth.authed ? (
    <div
      className="d-flex position-relative bg-dots-light overflow-hidden"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      <Col className="d-flex h-100 flex-column px-0">
        {!isHome && (
          <Row
            className="Nav"
            style={{
              height: '8%',
              minHeight: '8%',
            }}
          >
            <NavBar />
          </Row>
        )}
        <Container
          className="w-100 d-flex flex-column"
          fluid
          style={{
            height: '87%',
          }}
        >
          {children}
        </Container>
        <Row
          className="bg-revo2 py-2 text-light"
          style={{
            height: '5%',
            minHeight: '5%',
          }}
        >
          <small>Copyright © 2023 RevoTraffic. all rights reserved.</small>
        </Row>
      </Col>
    </div>
  ) : (
    <div
      className="d-flex position-relative"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
      <Col xs={12} className="d-flex flex-column">
        <Row className="flex-fill">{children}</Row>
      </Col>
    </div>
  )
}

AppWrapper.propTypes = {
  children: PropTypes.shape().isRequired,
  //   setting: PropTypes.shape().isRequired,
}

export default AppWrapper
