import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { Container, Row } from 'react-bootstrap'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Breadcrumb from './Breadcrumb'

function Steps({ setting }) {
  const { toolState } = setting
  const [step, setstep] = useState('Step1')
  const [datas, setdatas] = useState({
    geo: [],
    video: null,
    steps: [],
    projects: [],
    selected: '',
  })
  const { projects, selected } = datas
  const project = useMemo(
    () => (selected ? projects.find(({ id }) => id === selected) : {}),
    [selected]
  )

  const handleDataChange = (e, s) => {
    setdatas({ ...datas, [e.target.name]: e.target.value })
    if (s) setstep(s)
  }
  const steps = {
    Step1: (
      <Step1 setting={{ project, projects, toolState, handleDataChange }} />
    ),
    Step2: <Step2 />,
    Step3: <Step3 />,
    Step4: <Step4 />,
    Step5: <Step5 />,
  }

  const paths = useMemo(() => {
    if (!project.id) return []
    if (step === 'Step1')
      return [{ label: project.name }, { label: '請選擇交維階段' }]
    return [{ label: project.name }, { label: '交維階段' }]
  }, [project, step])

  return (
    <Container fluid className="w-100 h-100 d-flex flex-column p-4">
      <Row
        style={{
          height: '10%',
        }}
      >
        <Breadcrumb
          setting={{
            paths,
          }}
        />
      </Row>
      <Row className="flex-grow-1">{steps[step]}</Row>
    </Container>
  )
}

Steps.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Steps
