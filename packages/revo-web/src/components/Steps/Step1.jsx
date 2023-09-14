/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { DateRange } from 'react-date-range'
import {
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  ListGroupItem,
  // Image,
  Form,
  Modal,
  InputGroup,
} from 'react-bootstrap'
import { DraftContext } from '../ContextProvider'
// import { nenerabi } from '../../assets'

function ProjectModal({ setting }) {
  const { show, form, handleClose } = setting
  const [showDate, setshowDate] = useState(false)

  const [data, setdata] = useState({})
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  useEffect(() => {
    if (show) {
      setshowDate(false)
      setdata(form.reduce((prev, cur) => ({ ...prev, [cur.name]: '' }), {}))
    }
  }, [show])
  const [date, setdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  })
  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="py-2 px-4"
    >
      <Modal.Header closeButton />
      <Modal.Body className="p-4">
        {form.map((f, i) => (
          <React.Fragment key={i}>
            <Form.Label className="mb-1 mt-3 fw-bold text-revo">
              {f.label}
            </Form.Label>
            {f.type === 'date' ? (
              <InputGroup>
                <Form.Control
                  name={f.name}
                  type="text"
                  value={data[f.name] || f.placeholder}
                  placeholder={f.placeholder}
                  onFocus={() => setshowDate(!showDate)}
                  readOnly
                />
                <div
                  style={{
                    height: showDate ? '100%' : '0%',
                    transition: 'height .3s ease-in',
                    position: 'absolute',
                    left: '-50',
                  }}
                >
                  {showDate && (
                    <DateRange
                      ranges={[date]}
                      editableDateInputs
                      onChange={({ selection }) => {
                        setdate(selection)
                        onDataChange({
                          target: {
                            name: 'date',
                            value: `${moment(selection.startDate).format(
                              'yyyy-MM-DD'
                            )}-${moment(selection.endDate).format(
                              'yyyy-MM-DD'
                            )}`,
                          },
                        })
                      }}
                      moveRangeOnFirstSelection={false}
                    />
                  )}
                </div>
                <Button variant="revo2" onClick={() => setshowDate(!showDate)}>
                  確認
                </Button>
              </InputGroup>
            ) : (
              <Form.Control
                name={f.name}
                type={f.type}
                onChange={onDataChange}
                placeholder={f.placeholder}
                onFocus={() => setshowDate(false)}
              />
            )}
          </React.Fragment>
        ))}
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          className="ms-auto"
          style={{ boxShadow: 'none' }}
          variant="secondary"
          onClick={() => handleClose()}
        >
          取 消
        </Button>
        <Button
          className="me-auto"
          style={{ boxShadow: 'none' }}
          variant="revo"
          onClick={() => handleClose(data)}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Projects({ setting }) {
  const { handleAddStep } = setting
  const {
    draft,
    drafts,
    setDraftId,
    handleDraftAdd,
    handleDraftDelete,
    handleDraftEdit,
  } = useContext(DraftContext)

  const [show, setshow] = useState(false)
  const handleClose = (value) => {
    setshow(false)
    if (value) {
      if (draft.draft_id)
        handleDraftEdit(draft.draft_id, {
          steps: [...(draft.setting.steps || []), value],
        })
      else handleDraftAdd(value)
    }
  }

  const projectForm = [
    {
      name: 'id',
      label: '計劃編號',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'name',
      label: '計劃名稱',
      placeholder: '',
      type: 'text',
    },
  ]

  const stepForm = [
    {
      name: 'date',
      label: '階段日期',
      placeholder: '',
      type: 'date',
    },
    {
      name: 'name',
      label: '階段名稱',
      placeholder: '',
      type: 'text',
    },
  ]

  return (
    <>
      <Row>
        <Col xs={2} className="d-flex px-5">
          <h5 className="my-auto text-revo-light fw-bold">
            {draft.draft_id ? '請選擇交維階段' : '請選擇執行計劃'}
          </h5>
        </Col>
        <Col xs={1} className="d-flex ps-0">
          <Button
            className="me-auto"
            variant="revo"
            onClick={() => setshow(true)}
          >
            新 增 ✚
          </Button>
        </Col>
      </Row>
      {draft.draft_id ? (
        <Row className="flex-grow-1 pt-3 pb-5 px-5">
          {draft.setting.steps && draft.setting.steps.length ? (
            <ListGroup>
              {draft.setting.steps.map(({ date, name }, i) => (
                <ListGroupItem className="d-flex" key={i}>
                  <p className="my-auto">
                    {date}-{name}
                  </p>
                  <Button
                    className="ms-auto me-2"
                    style={{ boxShadow: 'none' }}
                    variant="revo"
                    onClick={() => handleAddStep({ date, name })}
                  >
                    選 擇
                  </Button>
                  <Button
                    style={{ boxShadow: 'none' }}
                    variant="danger"
                    onClick={() =>
                      handleDraftEdit(draft.draft_id, {
                        steps: draft.setting.steps.filter((s, j) => j !== i),
                      })
                    }
                  >
                    刪 除
                  </Button>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <div className="d-flex ps-3 border">
              <h5 className="m-auto text-revo-light">目前尚無資料</h5>
            </div>
          )}
        </Row>
      ) : (
        <Row className="flex-grow-1 pt-3 pb-5 px-5">
          {drafts.length ? (
            <ListGroup>
              {drafts.map((d) => (
                <ListGroupItem className="d-flex" key={d.draft_id}>
                  <p className="my-auto">
                    {d.setting.id}-{d.setting.name}
                  </p>
                  <Button
                    className="ms-auto me-2"
                    style={{ boxShadow: 'none' }}
                    variant="revo"
                    onClick={() => setDraftId(d.draft_id)}
                  >
                    選 擇
                  </Button>
                  <Button
                    style={{ boxShadow: 'none' }}
                    variant="danger"
                    onClick={() => handleDraftDelete(d.draft_id)}
                  >
                    刪 除
                  </Button>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <div className="d-flex ps-3 border">
              <h5 className="m-auto text-revo-light">目前尚無資料</h5>
            </div>
          )}
        </Row>
      )}
      <ProjectModal
        setting={{
          show,
          form: draft.draft_id ? stepForm : projectForm,
          handleClose,
        }}
      />
    </>
  )
}

function FlowChart() {
  return (
    <Row className="h-100 d-flex">
      <p
        className="text-center align-self-center fw-bolder pb-5"
        style={{ color: '#9fdd80', fontSize: '4rem' }}
      >
        Hello user !
      </p>
      {/* <Image className="mx-auto w-50" src={nenerabi} fluid /> */}
    </Row>
  )
}

function Step1({ setting }) {
  const { toolState, handleDataChange } = setting

  const components = {
    操作流程圖: <FlowChart />,
    計劃一覽表: (
      <Projects
        setting={{
          handleAddStep: (value) => {
            handleDataChange(
              {
                target: {
                  name: 'time',
                  value,
                },
              },
              'step2'
            )
          },
        }}
      />
    ),
  }

  return (
    <Container className="h-100 d-flex flex-column" fluid>
      {components[toolState.step1]}
    </Container>
  )
}

Step1.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Projects.propTypes = {
  setting: PropTypes.shape().isRequired,
}

ProjectModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step1
