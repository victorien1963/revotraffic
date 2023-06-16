import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Row } from 'react-bootstrap'
import { ToolBar, Steps } from '../components'

function Home({ setting }) {
  console.log(setting)
  const [toolState, settoolState] = useState({
    step1: '操作流程圖',
    activeStep: 0,
  })
  const handleToolChange = (e) =>
    settoolState({ ...toolState, [e.target.name]: e.target.value })

  return (
    <Container fluid className="h-100 d-flex flex-column">
      <Row>
        <ToolBar
          setting={{
            toolState,
            handleToolChange,
          }}
        />
      </Row>
      <Row className="flex-grow-1">
        <Steps
          setting={{
            toolState,
          }}
        />
      </Row>
    </Container>
  )
}

Home.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Home
