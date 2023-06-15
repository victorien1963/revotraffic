import React from 'react'
import PropTypes from 'prop-types'
import { Container, Navbar } from 'react-bootstrap'

function NavBar(props) {
  const { setting } = props
  console.log(setting)

  return (
    <Navbar bg="dark" variant="dark">
      <Container>
        <Navbar.Brand href="#home">路口、路段車流影像 Dashboard</Navbar.Brand>
      </Container>
    </Navbar>
  )
}

NavBar.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default NavBar
