/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { DateRange } from 'react-date-range'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  FormLabel,
  Button,
  Image,
  Modal,
  Spinner,
  InputGroup,
} from 'react-bootstrap'
import {
  fa1,
  fa2,
  fa3,
  fa4,
  faCheckCircle,
  faCircle,
} from '@fortawesome/free-solid-svg-icons'
import { camera7preview, camera14preview, camera7projected } from '../../assets'

function PointTag({ setting }) {
  const { id, style, handleRemovePoint } = setting
  return (
    <div className="position-absolute d-flex" style={style}>
      <FontAwesomeIcon
        id={id}
        className="h5 mt-2"
        style={{
          cursor: 'pointer',
        }}
        icon={faCircle}
        onClick={() => handleRemovePoint(id)}
      />
    </div>
  )
}

function LineModal({ setting }) {
  const { show, data, handleClose } = setting
  const initPoints = []
  const [points, setpoints] = useState(data || initPoints)
  const handleRemovePoint = (id) => {
    setpoints(points.filter((point) => id !== point.id))
  }
  console.log(points)

  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose(points)}
      className="p-2"
    >
      <Modal.Header closeButton />
      <Modal.Body className="d-flex">
        <div className="position-relative w-75 me-3">
          <Image
            className="mx-auto w-100"
            height="auto"
            src={camera7preview}
            fluid
            onClick={(e) => {
              if (points.length > 1) return
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              setpoints([
                ...points,
                {
                  id: points.length + 1,
                  style: {
                    top,
                    left,
                    width: '10px',
                    height: '10px',
                    color: 'red',
                  },
                },
              ])
            }}
          />
          {points.map((point) => (
            <PointTag
              key={point.id}
              setting={{ ...point, handleRemovePoint }}
            />
          ))}
          {points.length === 2 && (
            <hr
              className="position-absolute text-warning"
              style={{
                border: '2px dashed #ffc107',
                opacity: '1',
                top: (points[0].style.top + points[1].style.top) / 2 + 5,
                left:
                  (points[0].style.left + points[1].style.left) / 2 -
                  Math.sqrt(
                    Math.abs(points[0].style.top - points[1].style.top) ** 2 +
                      Math.abs(points[0].style.left - points[1].style.left) ** 2
                  ) /
                    2 +
                  5,
                width: Math.sqrt(
                  Math.abs(points[0].style.top - points[1].style.top) ** 2 +
                    Math.abs(points[0].style.left - points[1].style.left) ** 2
                ),
                rotate: `${
                  90 -
                  (180 / Math.PI) *
                    Math.atan2(
                      points[0].style.left - points[1].style.left,
                      points[0].style.top - points[1].style.top
                    )
                }deg`,
              }}
            />
          )}
        </div>
        <div className="ms-auto d-flex">
          <Button
            variant="secondary"
            className="mt-auto"
            onClick={() => {
              setpoints(initPoints)
            }}
          >
            重來
          </Button>
          <Button
            variant="revo"
            className="mt-auto ms-2"
            onClick={() => handleClose(points)}
          >
            確認
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

function ProjectedModal({ setting }) {
  const { show, data, handleClose } = setting
  const initPoints = []
  const [points, setpoints] = useState(data || initPoints)
  const handleRemovePoint = (id) => {
    setpoints(points.filter((point) => id !== point.id))
  }
  const initProject = {
    loading: false,
    show: false,
  }
  const [project, setproject] = useState(initProject)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const generatePic = () => {
    setproject({ loading: true, show: false })
  }
  useEffect(() => {
    const generate = async () => {
      await delay(1000)
      setproject({ loading: false, show: true })
    }
    if (project.loading) generate()
  }, [project.loading])

  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose([points])}
      className="p-2"
    >
      <Modal.Header closeButton />
      <Modal.Body className="d-flex">
        <div className="position-relative w-50 me-3">
          <Image
            className="mx-auto w-100"
            height="auto"
            src={camera7preview}
            fluid
            onClick={(e) => {
              if (points.length > 3) return
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              setpoints([
                ...points,
                {
                  id: points.length + 1,
                  style: {
                    top,
                    left,
                    width: '10px',
                    height: '10px',
                    color: 'red',
                  },
                },
              ])
            }}
          />
          {points.map((point) => (
            <PointTag
              key={point.id}
              setting={{ ...point, handleRemovePoint }}
            />
          ))}
        </div>
        <div className="position-relative w-25 d-flex">
          {project.loading && <Spinner className="m-auto" animation="border" />}
          {project.show && (
            <Image
              className="mx-auto w-50"
              height="auto"
              src={camera7projected}
              fluid
            />
          )}
          {!project.loading && !project.show && (
            <div className="d-flex px-5 border">
              <h5 className="m-auto text-revo-light text-center">校正後路段</h5>
            </div>
          )}
        </div>
        <div className="ms-auto d-flex">
          <Button
            variant="secondary"
            className="mt-auto"
            onClick={() => {
              setpoints(initPoints)
              setproject(initProject)
            }}
          >
            重來
          </Button>
          <Button variant="revo" className="mt-auto ms-2" onClick={generatePic}>
            校正
          </Button>
          <Button
            variant="revo2"
            className="mt-auto ms-2"
            onClick={() => handleClose()}
          >
            確認
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

function NumberTag({ setting }) {
  const { id, style } = setting
  const numbers = {
    1: fa1,
    2: fa2,
    3: fa3,
    4: fa4,
  }
  return (
    <div className="position-absolute d-flex" style={style}>
      <FontAwesomeIcon
        className="h5 mt-2"
        style={{
          cursor: 'pointer',
        }}
        icon={numbers[id]}
      />
    </div>
  )
}

function RoadTag({ setting }) {
  const { id, style, content, draging, setdraging } = setting
  return (
    <div
      id={id}
      onDragStart={() => {
        if (draging !== id) setdraging(id)
      }}
      onDrag={() => {}}
      className="position-absolute d-flex"
      draggable="true"
      style={style}
    >
      {content}
    </div>
  )
}

function RoadModal({ setting }) {
  const {
    show,
    handleClose,
    preview = camera14preview,
    hasDraggable = false,
    data,
  } = setting
  const initDraggables = [
    {
      id: 1,
      style: { width: '200px', top: '2%', left: '110%' },
      content: (
        <>
          <FormLabel className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded">
            東
          </FormLabel>
          <Form.Control />
        </>
      ),
    },
    {
      id: 2,
      style: { width: '200px', top: '16%', left: '110%' },
      content: (
        <>
          <FormLabel className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded">
            西
          </FormLabel>
          <Form.Control />
        </>
      ),
    },
    {
      id: 3,
      style: { width: '200px', top: '30%', left: '110%' },
      content: (
        <>
          <FormLabel className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded">
            南
          </FormLabel>
          <Form.Control />
        </>
      ),
    },
    {
      id: 4,
      style: { width: '200px', top: '44%', left: '110%' },
      content: (
        <>
          <FormLabel className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded">
            北
          </FormLabel>
          <Form.Control />
        </>
      ),
    },
  ]
  const [draggables, setdraggables] = useState(
    data ? data.draggables : initDraggables
  )
  const [draging, setdraging] = useState(0)

  const initClicks = {
    entry: [],
    outry: [],
  }
  const [clicks, setclicks] = useState(data ? data.clicks : initClicks)
  const [clicking, setclicking] = useState('')

  useEffect(() => {
    if (show) {
      setdraggables(data ? data.draggables : initDraggables)
      setclicks(data ? data.clicks : initClicks)
    }
  }, [show])
  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Body className="d-flex">
        <div className="position-relative w-50">
          <Image
            className="mx-auto w-100 h-100"
            src={preview}
            fluid
            onClick={(e) => {
              if (!clicking) return
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              setclicks({
                ...clicks,
                [clicking]: [
                  ...clicks[clicking],
                  {
                    id: clicks[clicking].length + 1,
                    style: {
                      top,
                      left,
                      width: '50px',
                      height: '50px',
                      color: clicking === 'entry' ? 'white' : 'black',
                    },
                  },
                ],
              })
            }}
            onDrop={(e) => {
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              setdraggables(
                draggables.map((d) =>
                  parseInt(d.id, 10) === parseInt(draging, 10)
                    ? { ...d, style: { ...d.style, top, left } }
                    : d
                )
              )
            }}
            onDragOver={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
          {hasDraggable &&
            draggables.map((d) => (
              <RoadTag key={d.id} setting={{ ...d, draging, setdraging }} />
            ))}
          {clicks.entry.map((e) => (
            <NumberTag key={e.id} setting={{ ...e }} />
          ))}
          {clicks.outry.map((o) => (
            <NumberTag key={o.id} setting={{ ...o }} />
          ))}
        </div>
        <div className="w-25 ms-auto d-flex flex-column">
          <Button
            className="my-2"
            variant="outline-dark"
            onClick={() => setclicking('entry')}
          >
            入口車道
          </Button>
          <Button
            className="my-2"
            variant="outline-dark"
            onClick={() => setclicking('outry')}
          >
            出口車道
          </Button>
          <div className="d-flex mt-auto ms-auto">
            <Button
              variant="secondary"
              className="mx-2"
              onClick={() => {
                setdraggables(initDraggables)
                setclicks(initClicks)
              }}
            >
              重來
            </Button>
            <Button
              variant="revo"
              className="mx-2 ms-2"
              onClick={() => handleClose({ draggables, clicks })}
            >
              校正
            </Button>
            <Button
              variant="revo2"
              className="mt-auto ms-2"
              onClick={() => handleClose()}
            >
              確認
            </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

function Road({ setting }) {
  // const { videos, roads, handleDataChange, handleToolChange } = setting
  const { roads, roads2, roadAdjust, roadLine, videos, handleDataChange } =
    setting
  const [selected, setselected] = useState('')
  const [showDate, setshowDate] = useState(false)
  const [date, setdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  })
  const [data, setdata] = useState({
    type: 'road',
  })
  const { type } = data
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  const initForm = [
    {
      name: 'name',
      label: '名稱',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'date',
      label: '日期',
      placeholder: '',
      type: 'date',
    },
    {
      name: 'type',
      label: '類型',
      placeholder: '',
      type: 'tab',
      content: [
        { label: '路口', name: 'type', value: 'road' },
        { label: '路段', name: 'type', value: 'project' },
      ],
    },
    {
      name: 'way',
      label: '方向',
      placeholder: '',
      type: 'road',
    },
    {
      name: 'entry',
      label: '出入口',
      placeholder: '',
      type: 'road',
    },
    {
      name: 'path',
      label: '車道數',
      placeholder: '',
      type: 'road',
    },
    {
      name: 'roadName',
      label: '各方向路名',
      placeholder: '',
      type: 'road',
    },
  ]
  const projectForm = [
    {
      name: 'name',
      label: '名稱',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'date',
      label: '日期',
      placeholder: '',
      type: 'date',
    },
    {
      name: 'type',
      label: '類型',
      placeholder: '',
      type: 'tab',
      content: [
        { label: '路口', name: 'type', value: 'road' },
        { label: '路段', name: 'type', value: 'project' },
      ],
    },
    {
      name: 'way',
      label: '車行方向',
      placeholder: '',
      type: 'road',
    },
    {
      name: 'path',
      label: '車道數',
      placeholder: '',
      type: 'road',
    },
  ]

  const [show, setshow] = useState(false)
  const [showProject, setshowProject] = useState(false)
  const [showLine, setshowLine] = useState(false)

  return (
    <>
      {selected !== '' ? (
        <Row className="flex-grow-1 pt-3 pb-5 px-4">
          <Col>
            {(type === 'road' ? initForm : projectForm).map((f, i) => {
              switch (f.type) {
                case 'project':
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={2}>
                          <Form.Label className="mb-0">{f.label}</Form.Label>
                        </Col>
                        <Col>
                          <FontAwesomeIcon
                            className="h5 mt-2"
                            style={{
                              cursor: 'pointer',
                            }}
                            icon={faCheckCircle}
                            onClick={() => setshowProject(true)}
                          />
                        </Col>
                      </Row>
                    </React.Fragment>
                  )
                case 'road':
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={2}>
                          <Form.Label className="mb-0">{f.label}</Form.Label>
                        </Col>
                        <Col>
                          <FontAwesomeIcon
                            className="h5 mt-2"
                            style={{
                              cursor: 'pointer',
                            }}
                            icon={faCheckCircle}
                            onClick={() => setshow(true)}
                          />
                        </Col>
                      </Row>
                    </React.Fragment>
                  )
                case 'tab':
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={2}>
                          <Form.Label className="mb-0">{f.label}</Form.Label>
                        </Col>
                        {f.content.map((c) => (
                          <Col
                            className={`py-1 ${
                              type === c.value ? 'bg-revo-mid rounded' : ''
                            }`}
                            key={c.value}
                            onClick={() => {
                              if (c.value === 'project') setshowProject(true)
                              onDataChange({
                                target: {
                                  ...c,
                                },
                              })
                            }}
                          >
                            {c.label}
                          </Col>
                        ))}
                      </Row>
                    </React.Fragment>
                  )
                case 'date':
                  return (
                    <React.Fragment key={i}>
                      <Row className="pt-3 pb-2">
                        <Col xs={2}>
                          <Form.Label className="mb-0">{f.label}</Form.Label>
                        </Col>
                        <Col>
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
                                        value: `${moment(
                                          selection.startDate
                                        ).format('yyyy-MM-DD')}-${moment(
                                          selection.endDate
                                        ).format('yyyy-MM-DD')}`,
                                      },
                                    })
                                  }}
                                  moveRangeOnFirstSelection={false}
                                />
                              )}
                            </div>
                            <Button
                              variant="revo2"
                              onClick={() => setshowDate(!showDate)}
                            >
                              確認
                            </Button>
                          </InputGroup>
                        </Col>
                      </Row>
                      <div
                        className="lh-sm me-auto small ps-5 text-secondary"
                        style={{ textAlign: 'start' }}
                      >
                        路口名稱格式：南北向路名＋東西向路名+路口，Ex.中正南平路口
                        <br />
                        路段名稱格式：路名＋路，Ex.中正路
                      </div>
                    </React.Fragment>
                  )
                default:
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={2}>
                          <Form.Label className="mb-0">{f.label}</Form.Label>
                        </Col>
                        <Col>
                          <Form.Control
                            name={f.name}
                            type={f.type}
                            onChange={onDataChange}
                            placeholder={f.placeholder}
                            onFocus={() => setshowDate(false)}
                          />
                        </Col>
                      </Row>
                    </React.Fragment>
                  )
              }
            })}
          </Col>
          <Col className="d-flex flex-column">
            <Image className="mx-auto w-75" src={camera7preview} fluid />
            <div className="d-flex mt-auto">
              <Button
                variant="warning"
                className="ms-auto me-2"
                onClick={() =>
                  type === 'road' ? setshow(true) : setshowProject(true)
                }
              >
                預覽
              </Button>
              <Button
                variant="revo"
                className="mx-2"
                onClick={() =>
                  type === 'road'
                    ? onDataChange({
                        target: {
                          name: 'type',
                          value: 'project',
                        },
                      })
                    : setshowLine(true)
                }
              >
                確認
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="pt-3 pb-5 px-0">
            <Col xs={2}>
              <FormLabel htmlFor="file">點擊以選擇影片</FormLabel>
            </Col>
          </Row>
          <Row className="pt-5 pb-5 px-4 border rounded mx-5">
            {videos.map(({ name }, i) => (
              <Col
                xs={3}
                className="flex-column h5 text-revo"
                key={name}
                onClick={() => setselected(i)}
              >
                <p
                  style={{
                    height: '10%',
                  }}
                >{`${i + 1}.${name}`}</p>
                <Image
                  title="選擇影片"
                  style={{ cursor: 'pointer' }}
                  className="mx-auto w-100 "
                  src={i % 2 === 0 ? camera7preview : camera14preview}
                  fluid
                />
              </Col>
            ))}
          </Row>
        </>
      )}
      <RoadModal
        setting={{
          show,
          data: type === 'road' ? roads : roads2,
          handleClose: (value) => {
            if (value)
              handleDataChange({
                target: {
                  name: type === 'road' ? 'roads' : 'roads2',
                  value,
                },
              })
            setshow(false)
          },
          hasDraggable: type === 'road',
          preview: type === 'road' ? camera14preview : camera7preview,
        }}
      />
      <ProjectedModal
        setting={{
          data: roadAdjust,
          show: showProject,
          handleClose: (value) => {
            if (value)
              handleDataChange({
                target: {
                  name: 'roadAdjust',
                  value,
                },
              })
            setshowProject(false)
          },
        }}
      />
      <LineModal
        setting={{
          data: roadLine,
          show: showLine,
          handleClose: (value) => {
            if (value) {
              handleDataChange(
                {
                  target: {
                    name: 'roadLine',
                    value,
                  },
                },
                'step3'
              )
            } else {
              setshowLine(false)
            }
          },
        }}
      />
    </>
  )
}

function Video({ setting }) {
  const { videos, handleDataChange, handleToolChange } = setting
  const [file, setfile] = useState(null)
  const [uploading, setuploading] = useState(false)
  const handleUpload = (e) => {
    setuploading(true)
    setfile(URL.createObjectURL(e.target.files[0]))
    handleDataChange({
      target: {
        name: 'videos',
        value: [...videos, e.target.files[0]],
      },
    })
  }
  const handleRemoveVideo = (i) =>
    handleDataChange({
      target: {
        name: 'videos',
        value: videos.filter((video, index) => index !== i),
      },
    })
  return (
    <>
      <Row className="pt-3 pb-2 px-2" style={{ height: '10vh' }}>
        <Col xs={2}>
          <Button variant="revo">
            <FormLabel htmlFor="file" className="mb-0">
              ⇪ 上傳影片檔案
            </FormLabel>
          </Button>
          <Form.Control
            id="file"
            name="file"
            type="file"
            onChange={handleUpload}
            style={{
              visibility: 'hidden',
            }}
          />
        </Col>
        <Col className="ps-0 pe-5">
          <Form.Control
            type="text"
            value={videos.length ? videos[videos.length - 1].name : ''}
            readOnly
          />
        </Col>
      </Row>
      <Row
        className="py-3 px-3 overflow-hidden border rounded mx-5"
        style={{ height: '82%' }}
      >
        {uploading ? (
          <>
            <Col xs={4} />
            <Col xs={4}>
              <video width="auto" height="420px" controls>
                <track kind="captions" />
                <source src={file} />
              </video>
              {/* <Image className="mx-auto w-100" src={camera7preview} fluid /> */}
            </Col>
            <Col className="d-flex pb-1">
              <Button
                variant="revo"
                className="mt-auto ms-auto me-2"
                onClick={() => setuploading(false)}
              >
                確認
              </Button>
              {/* <Button
                variant="secondary"
                className="mt-auto"
                // onClick={() => setuploading()}
              >
                清除
              </Button> */}
            </Col>
          </>
        ) : videos.length ? (
          <>
            {videos.map(({ name }, i) => (
              <Col
                xs={3}
                className="d-flex flex-column h5 text-revo"
                key={name}
              >
                <p
                  style={{
                    height: '10%',
                    marginBottom: '0',
                  }}
                >{`${`${i + 1} `}.${name}`}</p>
                <div className="position-relative">
                  <Image
                    className="mx-auto"
                    src={i % 2 === 0 ? camera7preview : camera14preview}
                    fluid
                  />
                  <div
                    className="position-absolute p-2"
                    style={{
                      top: '0%',
                      right: '0%',
                    }}
                  >
                    <FontAwesomeIcon
                      style={{
                        cursor: 'pointer',
                      }}
                      icon={faCheckCircle}
                      onClick={() => {}}
                    />
                  </div>
                </div>
                <Button
                  variant="danger"
                  className="mb-auto mt-2 mx-auto"
                  size="sm"
                  onClick={() => handleRemoveVideo(i)}
                >
                  ✖ 移 除
                </Button>
              </Col>
            ))}
            <Col className="d-flex p-5 pe-0 pb-1">
              <Button
                variant="revo"
                className="mt-auto ms-auto"
                onClick={() =>
                  handleToolChange({
                    target: {
                      name: 'step2',
                      value: 'selector',
                    },
                  })
                }
              >
                確認
              </Button>
            </Col>
          </>
        ) : (
          <div className="d-flex ps-3">
            <h5 className="m-auto text-revo-light">目前尚無資料</h5>
          </div>
        )}
      </Row>
    </>
  )
}

function Step2({ setting }) {
  const {
    videos,
    roads,
    roads2,
    roadAdjust,
    roadLine,
    toolState,
    handleDataChange,
    handleToolChange,
  } = setting
  const components = {
    selector: (
      <Row className="h-100 px-5">
        {[
          {
            label: '影片上傳',
            name: 'step2',
            value: '影片上傳',
          },
          {
            label: '路口、路段標記',
            name: 'step2',
            value: '路口、路段標記',
          },
          {
            label: '車種標記',
            name: 'step2',
            value: '車種標記',
          },
          {
            label: '軌跡標記',
            name: 'step2',
            value: '軌跡標記',
          },
        ].map((s) => (
          <Col xs={3} className="d-flex px-3" key={s.value}>
            <div
              className="my-auto py-5 w-100"
              style={{
                height: '500px',
              }}
            >
              <Card
                className="h-75 w-100 d-flex bg-revo-light fs-5 fw-bold text-revo"
                style={{ cursor: 'pointer' }}
                title={s.value}
                onClick={() =>
                  handleToolChange({
                    target: { name: 'step2', value: s.value },
                  })
                }
              >
                <span className="m-auto">{s.label}</span>
              </Card>
              <FontAwesomeIcon className="h5 mt-2" icon={faCircle} />
            </div>
          </Col>
        ))}
      </Row>
    ),
    影片上傳: (
      <Video
        setting={{
          videos,
          handleDataChange,
          handleToolChange,
        }}
      />
    ),
    '路口、路段標記': (
      <Road
        setting={{
          videos,
          roads,
          roads2,
          roadAdjust,
          roadLine,
          handleDataChange,
        }}
      />
    ),
  }

  return (
    <Container className="h-100 d-flex flex-column" fluid>
      {components[toolState.step2]}
    </Container>
  )
}

Step2.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Video.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Road.propTypes = {
  setting: PropTypes.shape().isRequired,
}

RoadModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

ProjectedModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

LineModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

RoadTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

NumberTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

PointTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step2
