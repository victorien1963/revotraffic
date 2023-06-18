import React, { useState, useMemo } from 'react'
import { Container, Row } from 'react-bootstrap'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Breadcrumb from './Breadcrumb'
import ToolBar from './ToolBar'

function Steps() {
  const [step, setstep] = useState('step1')
  const [toolState, settoolState] = useState({
    step1: '操作流程圖',
    step2: 'selector',
    step3: '影像辨識',
    activeStep: 0,
  })
  const handleToolChange = (e) => {
    if (e.target.name.startsWith('step')) setstep(e.target.name)
    settoolState({ ...toolState, [e.target.name]: e.target.value })
  }

  const [datas, setdatas] = useState({
    roadLine: null,
    roadAdjust: null,
    roads2: null,
    roads: null,
    videos: [],
    time: {},
    projects: [],
    selectedProject: '',
  })
  const {
    roadLine,
    roadAdjust,
    roads2,
    roads,
    videos,
    time,
    projects,
    selectedProject,
  } = datas
  const project = useMemo(
    () =>
      selectedProject ? projects.find(({ id }) => id === selectedProject) : {},
    [selectedProject]
  )

  const handleDataChange = (e, s) => {
    if (e.target) setdatas({ ...datas, [e.target.name]: e.target.value })
    if (s) setstep(s)
  }
  const steps = {
    step1: (
      <Step1 setting={{ project, projects, toolState, handleDataChange }} />
    ),
    step2: (
      <Step2
        setting={{
          videos,
          roads,
          roads2,
          roadLine,
          roadAdjust,
          time,
          toolState,
          handleToolChange,
          handleDataChange,
        }}
      />
    ),
    step3: <Step3 setting={{ toolState, handleDataChange }} />,
    step4: <Step4 setting={{ toolState, handleDataChange }} />,
    step5: <Step5 setting={{ toolState, handleDataChange }} />,
  }

  const paths = useMemo(() => {
    if (!project.id) return []
    if (step === 'step1')
      return [{ label: project.name }, { label: '請選擇交維階段' }]
    return [{ label: project.name }, { label: '交維階段' }]
  }, [project, step])

  return (
    <Container
      fluid
      className="w-100 h-100 d-flex flex-column p-0 overflow-hidden"
    >
      <ToolBar
        setting={{
          toolState,
          handleToolChange,
        }}
      />

      <Row
        style={{
          height: '10%',
          minHeight: '10%',
        }}
      >
        <Breadcrumb
          setting={{
            paths,
          }}
        />
      </Row>
      <Row className="flex-grow-1 overflow-hidden">{steps[step]}</Row>
    </Container>
  )
}

export default Steps
