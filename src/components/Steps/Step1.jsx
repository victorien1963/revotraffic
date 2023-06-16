import React, { useState, useEffect } from 'react'
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
  Image,
  Form,
  Modal,
} from 'react-bootstrap'
import { nenerabi } from '../../assets'

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
      className="p-2"
    >
      <Modal.Body>
        {form.map((f, i) => (
          <React.Fragment key={i}>
            <Form.Label>{f.label}</Form.Label>
            {f.type === 'date' ? (
              <>
                <Form.Control
                  name={f.name}
                  type="text"
                  value={data[f.name]}
                  placeholder={f.placeholder}
                  onFocus={() => setshowDate(!showDate)}
                />
                <div
                  style={{
                    height: showDate ? '100%' : '0%',
                    transition: 'height .3s ease-in',
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
              </>
            ) : (
              <Form.Control
                name={f.name}
                type={f.type}
                value={data[f.name]}
                onChange={onDataChange}
                placeholder={f.placeholder}
                onFocus={() => setshowDate(false)}
              />
            )}
          </React.Fragment>
        ))}
      </Modal.Body>
      <Modal.Footer>
        <Button
          style={{ boxShadow: 'none', color: '#317985' }}
          variant="link"
          onClick={() => handleClose(data)}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Projects({ setting }) {
  const {
    project,
    projects,
    handleAddProject,
    handleRemoveProject,
    handleSelectProject,
  } = setting
  console.log(project)
  console.log(projects)
  const [show, setshow] = useState(false)
  const handleClose = (value) => {
    setshow(false)
    console.log(value)
    if (value) handleAddProject(value)
  }

  const projectForm = [
    {
      name: 'id',
      label: '計畫編號',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'name',
      label: '計畫名稱',
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
        <Col xs={2} className="d-flex">
          <h5 className="my-auto">請選擇執行計畫</h5>
        </Col>
        <Col xs={1}>
          <Button onClick={() => setshow(true)}>新增</Button>
        </Col>
      </Row>
      {project.id ? (
        <Row className="flex-grow-1">
          {projects.steps ? (
            <ListGroup>
              {projects.steps.map(({ id, name }) => (
                <ListGroupItem className="d-flex" key={id}>
                  <p className="my-auto">{name}</p>
                  <Button
                    className="ms-auto"
                    style={{ boxShadow: 'none', color: '#317985' }}
                    variant="link"
                    onClick={() => handleRemoveProject(id)}
                  >
                    刪 除
                  </Button>
                  <Button
                    style={{ boxShadow: 'none', color: '#317985' }}
                    variant="link"
                    onClick={() => handleSelectProject(id)}
                  >
                    選 擇
                  </Button>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <span className="ps-3">目前無資料</span>
          )}
        </Row>
      ) : (
        <Row className="flex-grow-1">
          {projects.length ? (
            <ListGroup>
              {projects.map(({ id, name }) => (
                <ListGroupItem className="d-flex" key={id}>
                  <p className="my-auto">{name}</p>
                  <Button
                    className="ms-auto"
                    style={{ boxShadow: 'none', color: '#317985' }}
                    variant="link"
                    onClick={() => handleRemoveProject(id)}
                  >
                    刪 除
                  </Button>
                  <Button
                    style={{ boxShadow: 'none', color: '#317985' }}
                    variant="link"
                    onClick={() => handleSelectProject(id)}
                  >
                    選 擇
                  </Button>
                </ListGroupItem>
              ))}
            </ListGroup>
          ) : (
            <span className="ps-3">目前無資料</span>
          )}
        </Row>
      )}
      <ProjectModal
        setting={{
          show,
          form: project.id ? stepForm : projectForm,
          handleClose,
        }}
      />
    </>
  )
}

function FlowChart() {
  return (
    <Row className="h-100 d-flex">
      <Image className="mx-auto w-50" src={nenerabi} fluid />
    </Row>
  )
}

function Step1({ setting }) {
  const { project, projects, toolState, handleDataChange } = setting
  const components = {
    操作流程圖: <FlowChart />,
    計畫一覽表: (
      <Projects
        setting={{
          project,
          projects,
          handleAddProject: (value) =>
            handleDataChange({
              target: { name: 'projects', value: [...projects, value] },
            }),
          handleRemoveProject: (id) =>
            handleDataChange({
              target: {
                name: 'projects',
                value: projects.filter((f) => f.id !== id),
              },
            }),
          handleSelectProject: (id) =>
            handleDataChange({
              target: {
                name: 'selected',
                value: id,
              },
            }),
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
