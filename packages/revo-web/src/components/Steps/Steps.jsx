import React, { useState, useMemo, useContext, useEffect } from 'react'
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
  const {
    draft,
    // draftId,
    range,
    // rangeId,
    time,
    timeId,
    setDraftId,
    setRangeId,
    setTimeId,
  } = useContext(DraftContext)

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
    if (e.target.name === 'step1') {
      setDraftId('')
    }
    settoolState({ ...toolState, [e.target.name]: e.target.value })
  }

  const steps = {
    step1: <Step1 setting={{ toolState }} />,
    step2: (
      <Step2
        setting={{
          toolState,
          handleToolChange,
        }}
      />
    ),
    step3: <Step3 setting={{ toolState, handleToolChange }} />,
    step4: <Step4 setting={{ toolState, handleToolChange }} />,
    step5: <Step5 setting={{ toolState }} />,
  }
  useEffect(() => {
    setstep(timeId ? 'step2' : 'step1')
    settoolState({ ...toolState, step2: 'selector' })
  }, [timeId])

  const paths = useMemo(() => {
    if (!draft) return []
    if (!range)
      return [
        {
          label: `${draft.setting.id}-${draft.setting.name}`,
          onClick: () => setDraftId(''),
        },
        { label: '請選擇計畫範圍' },
      ]
    if (!time)
      return [
        {
          label: `${draft.setting.id}-${draft.setting.name}`,
          onClick: () => setDraftId(''),
        },
        {
          label: `${range.setting.id}-${range.setting.name}`,
          onClick: () => setRangeId(''),
        },
        { label: '請選擇交維階段' },
      ]
    if (step === 'step2')
      return [
        {
          label: `${draft.setting.id}-${draft.setting.name}`,
          onClick: () => setDraftId(''),
        },
        {
          label: `${range.setting.id}-${range.setting.name}`,
          onClick: () => setRangeId(''),
        },
        {
          label: `${time.setting.date} - ${time.setting.name}`,
          onClick: () => setTimeId(''),
        },
        {
          label:
            toolState.step2 === '路口＆路段標記'
              ? '路口＆路段標記'
              : '影片上傳',
        },
      ]
    return [
      {
        label: `${draft.setting.id}-${draft.setting.name}`,
        onClick: () => setDraftId(''),
      },
      {
        label: `${range.setting.id}-${range.setting.name}`,
        onClick: () => setRangeId(''),
      },
      {
        label: `${time.setting.date} - ${time.setting.name}`,
        onClick: () => setTimeId(''),
      },
    ]
  }, [draft, range, time, step, toolState])

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
        className="px-5"
        style={{
          height: '10%',
          minHeight: '10%',
          alignContent: 'center',
          color: 'dark',
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
