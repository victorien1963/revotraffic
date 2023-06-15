import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'

function Steps({ setting }) {
  const { toolState } = setting
  const [step, setstep] = useState('Step1')
  const [datas, setdatas] = useState({
    projects: [],
  })
  const { projects } = datas
  const handleDataChange = (e) =>
    setdatas({ ...datas, [e.target.name]: e.target.value })
  console.log(setstep)
  console.log(datas)
  const steps = {
    Step1: <Step1 setting={{ projects, toolState, handleDataChange }} />,
    Step2: <Step2 />,
    Step3: <Step3 />,
    Step4: <Step4 />,
    Step5: <Step5 />,
  }

  return (
    <Container fluid className="w-100 h-100 p-4">
      {steps[step]}
    </Container>
  )
}

Steps.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Steps
