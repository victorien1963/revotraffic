import React from 'react'
import { Container, Row } from 'react-bootstrap'
import { Steps } from '../components'

function Home() {
  return (
    <Container fluid className="h-100 d-flex flex-column">
      <Row className="flex-grow-1">
        <Steps />
      </Row>
    </Container>
  )
}

export default Home
