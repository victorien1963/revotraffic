import React, { useState, useMemo, useContext } from 'react'
import { Container, Row } from 'react-bootstrap'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Step5 from './Step5'
import Breadcrumb from './Breadcrumb'
import ToolBar from './ToolBar'
import { DraftContext } from '../ContextProvider'

function Steps() {
  const [step, setstep] = useState('step1')
  const [toolState, settoolState] = useState({
    step1: '操作流程圖',
    step2: 'selector',
    step3: '影像辨識',
    step4: 'selector',
    activeStep: 0,
  })
  const handleToolChange = (e) => {
    if (e.target.name.startsWith('step')) setstep(e.target.name)
    settoolState({ ...toolState, [e.target.name]: e.target.value })
  }
  const { draft, draftId, setDrafts } = useContext(DraftContext)
  const {
    modals = [],
    roadLine = null,
    roadAdjust = null,
    roads = null,
    videos = [],
    time = {},
  } = draft

  const handleDataChange = (e, s) => {
    if (e.target)
      setDrafts((prevState) =>
        prevState.map((ps) =>
          ps.draft_id === draftId
            ? { ...ps, [e.target.name]: e.target.value }
            : ps
        )
      )
    if (s) setstep(s)
  }
  const steps = {
    step1: <Step1 setting={{ toolState, handleDataChange }} />,
    step2: (
      <Step2
        setting={{
          videos,
          roads,
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
    step4: (
      <Step4
        setting={{ modals, toolState, handleDataChange, handleToolChange }}
      />
    ),
    step5: <Step5 setting={{ toolState, handleDataChange }} />,
  }

  const paths = useMemo(() => {
    if (!draftId) return []
    if (!time.name)
      return [
        { label: `${draft.setting.id}-${draft.setting.name}` },
        { label: '請選擇交維階段' },
      ]
    if (step === 'step2')
      return [
        { label: `${draft.setting.id} - ${draft.setting.name}` },
        { label: `${time.date} - ${time.name}` },
        {
          label:
            toolState.step2 === '路口、路段標記'
              ? '路口、路段資訊'
              : '影片上傳',
        },
      ]
    return [
      { label: `${draft.setting.id} - ${draft.setting.name}` },
      { label: `${time.date} - ${time.name}` },
    ]
  }, [draft, step, toolState])

  return (
    <Container
      fluid
      className="w-100 h-100 d-flex flex-column p-0 overflow-hidden"
    >
      <ToolBar
        setting={{
          step,
          toolState,
          handleToolChange,
        }}
      />

      <Row
        className="px-4"
        style={{
          height: '10%',
          minHeight: '10%',
          alignContent: 'center',
          color: '#0e594f',
          fontWeight: '600',
          fontSize: '1rem',
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