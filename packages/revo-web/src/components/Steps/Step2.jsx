/* eslint-disable react/button-has-type */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-nested-ternary */
import React, { useContext, useEffect, useState, useMemo, useRef } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { DateRange } from 'react-date-range'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileVideo,
  faLocationDot,
  faCarRear,
  faArrowsToDot,
  faCheckCircle,
  faCircle,
  faCircleInfo,
  faFileArrowUp,
  faTrashCan,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  FormLabel,
  Button,
  ButtonGroup,
  Image,
  Modal,
  Spinner,
  InputGroup,
} from 'react-bootstrap'
import VideoSnapshot from 'video-snapshot'
import { remark1, remark2 } from '../../assets'
import LoadingButton from '../LoadingButton'
import apiServices from '../../services/apiServices'
import { DraftContext, ToastContext } from '../ContextProvider'

function WarnModal({ setting }) {
  const { show, handleClose, content, hasCancel } = setting

  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="py-2 px-4"
    >
      <Modal.Header closeButton>系統提示</Modal.Header>
      <Modal.Body className="p-4 h-100">
        <Row
          style={{
            height: '100px',
          }}
        >
          <FontAwesomeIcon
            className="h-75 px-0 my-auto text-revo"
            icon={faCircleExclamation}
          />
        </Row>
        <Row className="text-center p-3 text-revo lh-sm">
          <h4>注意!</h4>
          <h5>{content}</h5>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        {hasCancel && (
          <Button
            className="ms-auto"
            style={{ boxShadow: 'none' }}
            variant="secondary"
            onClick={() => handleClose()}
          >
            取消
          </Button>
        )}
        <Button
          className={hasCancel ? 'me-auto' : 'mx-auto'}
          style={{ boxShadow: 'none' }}
          variant="revo3"
          onClick={() => handleClose(true)}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function LabelTag({ setting }) {
  const { id, label = '', style, handleRemovePoint } = setting
  return (
    <div className="position-absolute d-flex" style={style}>
      <FontAwesomeIcon
        id={id}
        className="h5 mt-2"
        style={{
          cursor: 'pointer',
          width: '30px',
          height: '30px',
        }}
        icon={faCircle}
        onDoubleClick={() => handleRemovePoint(id)}
      />
      <div
        className="position-absolute d-flex text-white fw-bold"
        style={{
          left: '0px',
          top: '6px',
          width: '30px',
          height: '30px',
          pointerEvents: 'none',
        }}
      >
        <span className="m-auto">{label}</span>
      </div>
    </div>
  )
}

function PointTag({ setting }) {
  const { id, style, handleRemovePoint, draging, setdraging } = setting
  return (
    <div
      className="position-absolute d-flex"
      onDrag={() => {}}
      onDragStart={() => {
        if (draging !== id) setdraging(id)
      }}
      draggable="true"
      style={style}
    >
      <FontAwesomeIcon
        id={id}
        className="h5 mt-2"
        style={{
          cursor: 'pointer',
        }}
        icon={faCircle}
        onDoubleClick={() => handleRemovePoint(id)}
      />
    </div>
  )
}

function LineModal({ setting }) {
  const { show, fixed, data } = setting
  const initPoints = []
  const [points, setpoints] = useState(data || initPoints)
  const handleRemovePoint = (id) => {
    setpoints(points.filter((point) => id !== point.id))
  }

  const imageRef = useRef(null)

  const handleClose = (roadLine) => {
    if (!roadLine) {
      setting.handleClose()
      return
    }

    try {
      let scale = {
        wScale: 1,
        hScale: 1,
      }
      try {
        scale = {
          wScale: imageRef.current.naturalWidth / imageRef.current.clientWidth,
          hScale:
            imageRef.current.naturalHeight / imageRef.current.clientHeight,
        }
      } catch (e) {
        console.log('-----scale not included-----')
      }
      const { wScale, hScale } = scale
      const warpPixelRate =
        10 /
        Math.max(
          Math.abs(points[0].style.top - points[1].style.top) * hScale,
          Math.abs(points[0].style.left - points[1].style.left) * wScale
        )
      setting.handleClose({
        warpPixelRate,
        roadLine,
      })
    } catch (e) {
      console.log(e)
      setting.handleClose()
    }
  }

  const [draging, setdraging] = useState(-1)

  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose(points)}
      className="p-2"
    >
      <Modal.Header className="h5 text-revo" closeButton>
        標記距離基準
      </Modal.Header>
      <Modal.Body className="d-flex">
        <div className="d-flex position-relative w-75 mx-auto">
          <Image
            ref={imageRef}
            style={{ cursor: 'pointer' }}
            className="w-100"
            height="auto"
            src={`/api/draft/video/${fixed}`}
            fluid
            onClick={(e) => {
              if (points.length > 1) return
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x - 15
              const top = e.clientY - target.y - 20
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
            onDrop={(e) => {
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              if (draging > 0) {
                setpoints(
                  points.map((point) =>
                    point.id === draging
                      ? { ...point, style: { ...point.style, top, left } }
                      : point
                  )
                )
              }
            }}
            onDragOver={(e) => {
              e.stopPropagation()
              e.preventDefault()
            }}
          />
          {points.map((point) => (
            <PointTag
              key={point.id}
              setting={{ ...point, handleRemovePoint, draging, setdraging }}
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
        <div className="w-25 ms-auto d-flex flex-column">
          <h6 className="text-center text-secondary">
            <FontAwesomeIcon icon={faCircleInfo} title="說明" />
            &ensp;雙擊於圖片中拉出兩個點，並使其相連（距離 10 公尺）。
          </h6>
          <Image className="mx-auto" height="auto" src={remark2} fluid />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          className="mt-auto"
          onClick={() => {
            setpoints(initPoints)
          }}
        >
          清除
        </Button>
        <Button
          variant="revo"
          className="mt-auto ms-2"
          onClick={() => handleClose(points)}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ProjectedModal({ setting }) {
  const { show, thumbnail, data = {} } = setting
  const initPoints = []
  const [points, setpoints] = useState(data?.points || initPoints)
  const handleRemovePoint = (id) => {
    setpoints(points.filter((point) => id !== point.id))
  }
  const initProject = {
    loading: false,
    show: false,
  }
  const [project, setproject] = useState(data.project || initProject)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const generatePic = () => {
    setproject({ loading: true, show: false })
  }

  const imageRef = useRef(null)
  const handleClose = (value) => {
    try {
      const params = {
        roadAdjust: value,
        fixed: value.fixed,
      }
      const slopeRLDifference = Math.abs(
        (points[0].style.top - points[1].style.top) /
          (points[0].style.left - points[1].style.left) -
          (points[3].style.top - points[2].style.top) /
            (points[3].style.left - points[2].style.left)
      )
      const slopeUDDifference = Math.abs(
        (points[0].style.top - points[3].style.top) /
          (points[0].style.left - points[3].style.left) -
          (points[1].style.top - points[2].style.top) /
            (points[1].style.left - points[2].style.left)
      )
      if (imageRef.current) {
        params.tarW =
          slopeRLDifference > slopeUDDifference
            ? imageRef.current.naturalWidth / 4
            : imageRef.current.naturalWidth
        params.tarH =
          slopeRLDifference < slopeUDDifference
            ? imageRef.current.naturalHeight / 4
            : imageRef.current.naturalHeight
      }
      setting.handleClose(params)
    } catch (e) {
      console.log(e)
      setting.handleClose()
    }
  }

  const [fixed, setfixed] = useState(data?.fixed)
  useEffect(() => {
    const generate = async () => {
      await delay(1000)
      let wScale = 1
      let hScale = 1
      if (imageRef.current) {
        wScale = imageRef.current.naturalWidth / imageRef.current.clientWidth
        hScale = imageRef.current.naturalHeight / imageRef.current.clientHeight
      }

      const res = await apiServices.data({
        path: `warp_image`,
        method: 'post',
        params: {
          lu: `${points[0].style.left * wScale},${
            points[0].style.top * hScale
          }`,
          ld: `${points[1].style.left * wScale},${
            points[1].style.top * hScale
          }`,
          ru: `${points[2].style.left * wScale},${
            points[2].style.top * hScale
          }`,
          rd: `${points[3].style.left * wScale},${
            points[3].style.top * hScale
          }`,
          Key: thumbnail.name,
        },
      })
      setfixed(res.data.name)

      // lu=126,226&ld=115,296&ru=264,252&rd=252,334
      // 選填參數 height=輸出圖片高度， width=輸出圖片寬度 (這兩個沒填，則預設用輸入圖片的長寬)

      setproject({ loading: false, show: true })
    }
    if (project.loading && points.length === 4) generate()
  }, [project.loading])

  const labels = ['LU', 'LD', 'RU', 'RD']

  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Header className="h5 text-revo" closeButton>
        投影轉換
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex">
          <h6 className="w-50 position-relative py-3 ps-3 text-left text-secondary">
            <FontAwesomeIcon icon={faCircleInfo} title="說明" />
            &ensp;在影片截圖上按下路段 4 個角， 並按下校正進行投影視角轉換。
          </h6>
          <h6 className="w-50 position-relative py-3 text-center text-secondary">
            &ensp;校正後
          </h6>
        </div>
        <div className="d-flex">
          <div
            className="position-relative"
            style={{
              width: '49%',
            }}
          >
            <Image
              ref={imageRef}
              className="mx-auto w-100"
              height="auto"
              src={`/api/draft/video/${thumbnail.name}`}
              fluid
              onClick={(e) => {
                if (points.length > 3) return
                const target = e.target.getBoundingClientRect()
                const left = e.clientX - target.x - 15
                const top = e.clientY - target.y - 20
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
            {points.map((point, i) => (
              <LabelTag
                key={point.id}
                setting={{ ...point, label: labels[i], handleRemovePoint }}
              />
            ))}
          </div>
          <div
            style={{
              width: '1%',
              borderRight: '2px dashed rgb(204 204 204)',
            }}
          />
          <div
            style={{
              width: '1%',
            }}
          />
          <div
            className="position-relative d-flex justify-content-center rounded-lg"
            style={{
              width: '49%',
            }}
          >
            {project.loading && (
              <Spinner className="m-auto" animation="border" />
            )}
            {!project.loading && (project.show || fixed) && (
              <Image
                className="mx-auto"
                height="auto"
                src={`/api/draft/video/${fixed}`}
                fluid
              />
            )}
            {!project.loading && !project.show && !fixed && (
              <div className="d-flex w-100 border">
                <h5 className="m-auto text-revo-light text-center">
                  校正後路段
                </h5>
              </div>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button
          variant="secondary"
          className="mt-auto"
          onClick={() => {
            setpoints(initPoints)
            setproject(initProject)
          }}
        >
          清除
        </Button>
        <Button variant="revo" className="mt-auto ms-2" onClick={generatePic}>
          校正
        </Button>
        <Button
          variant="revo2"
          className="mt-auto ms-2"
          onClick={() => handleClose({ points, project, fixed })}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function NumberTag({ setting }) {
  const {
    id,
    style,
    handleDelete,
    draging,
    setdraging,
    setshowNL,
    draggable = true,
  } = setting
  const numbers = {
    5: '➊',
    6: '➋',
    7: '➌',
    8: '➍',
    10: '➊',
    11: '➋',
    12: '➌',
    13: '➍',
  }
  return (
    <h1
      className="position-absolute d-flex h1 textShadow justify-content-center mb-0"
      onDragStart={() => {
        if (draging !== id) {
          setdraging(id)
        }
        setshowNL(true)
      }}
      onDrag={() => {}}
      onDoubleClick={handleDelete}
      draggable={draggable}
      style={{
        ...style,
        left: style.left - 25,
        top: style.top - 25,
        cursor: draggable ? 'grab' : 'auto',
        zIndex: 1,
      }}
    >
      {numbers[id]}
    </h1>
  )
}

function RoadTag({ setting }) {
  const {
    id,
    style,
    content,
    draging,
    setdraging,
    setshowNL,
    draggable = true,
  } = setting
  return (
    <div
      id={id}
      onDragStart={() => {
        if (draging !== id) setdraging(id)
        setshowNL(true)
      }}
      onDrag={() => {}}
      className="position-absolute d-flex"
      draggable={draggable}
      style={{
        ...style,
        left: style.left - 20 || style.left,
        top: style.top - 20 || style.top,
        cursor: draggable ? 'grab' : 'auto',
        zIndex: 1,
      }}
    >
      {content}
    </div>
  )
}

function RoadModal({ setting }) {
  const {
    show,
    handleClose,
    thumbnail,
    data,
    hasDraggable = false,
    hasRoadName = true,
  } = setting
  const initDraggables = [
    {
      id: 1,
      style: { width: '200px', top: '2%', left: '110%' },
      label: '東',
      name: '',
    },
    {
      id: 2,
      style: { width: '200px', top: '16%', left: '110%' },
      label: '西',
      name: '',
    },
    {
      id: 3,
      style: { width: '200px', top: '30%', left: '110%' },
      label: '南',
      name: '',
    },
    {
      id: 4,
      style: { width: '200px', top: '44%', left: '110%' },
      label: '北',
      name: '',
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
  const [clicking, setclicking] = useState('entry')
  const getId = (t, l) => {
    const start = t === 'entry' ? 5 : 10
    const ids = l.map(({ id }) => id)
    if (!ids.includes(start)) return start
    if (!ids.includes(start + 1)) return start + 1
    if (!ids.includes(start + 2)) return start + 2
    return start + 3
  }

  useEffect(() => {
    if (show) {
      setdraggables(data ? data.draggables : initDraggables)
      setclicks(data ? data.clicks : initClicks)
    }
  }, [show])

  const [showNL, setshowNL] = useState(false)
  const [NL, setNL] = useState({
    left: 0,
    top: 0,
  })
  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Header className="h5 text-revo" closeButton>
        方向與出入口標記
      </Modal.Header>
      <Modal.Body className="d-flex">
        <div className="position-relative w-50">
          <div
            className="position-absolute"
            style={{
              // height: '100%',
              // width: '1px',
              top: '-25px',
              left: NL.left - 10,
              display: showNL ? 'block' : 'none',
              pointerEvents: 'none',
            }}
          >
            {NL.left}
          </div>
          <div
            className="position-absolute"
            style={{
              right: '-30px',
              top: NL.top - 10,
              display: showNL ? 'block' : 'none',
              pointerEvents: 'none',
            }}
          >
            {NL.top}
          </div>
          <div
            className="position-absolute"
            style={{
              height: '100%',
              width: '1px',
              top: 0,
              left: NL.left,
              borderStyle: 'dashed',
              borderColor: 'white',
              display: showNL ? 'block' : 'none',
              pointerEvents: 'none',
            }}
          />
          <div
            className="position-absolute"
            style={{
              height: '1px',
              width: '100%',
              top: NL.top,
              left: 0,
              borderStyle: 'dashed',
              borderColor: 'white',
              display: showNL ? 'block' : 'none',
              pointerEvents: 'none',
            }}
          />
          <Image
            className="mx-auto w-100 h-100"
            src={`/api/draft/video/${thumbnail.name}`}
            fluid
            onClick={(e) => {
              if (!clicking) return
              if (clicks[clicking].length >= 4) return
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              setclicks((prevState) => ({
                ...prevState,
                [clicking]: [
                  ...prevState[clicking],
                  {
                    id: getId(clicking, prevState[clicking]),
                    style: {
                      top,
                      left,
                      width: '50px',
                      height: '50px',
                      color: clicking === 'entry' ? 'white' : 'black',
                    },
                  },
                ],
              }))
            }}
            onDrop={(e) => {
              setshowNL(false)
              const target = e.target.getBoundingClientRect()
              const left = e.clientX - target.x
              const top = e.clientY - target.y
              if (draging < 5) {
                setdraggables(
                  draggables.map((d) =>
                    parseInt(d.id, 10) === parseInt(draging, 10)
                      ? { ...d, style: { ...d.style, top, left } }
                      : d
                  )
                )
              } else if (draging < 10) {
                setclicks((prevState) => ({
                  ...prevState,
                  entry: prevState.entry.map((ps) =>
                    ps.id === draging
                      ? {
                          ...ps,
                          style: {
                            ...ps.style,
                            top,
                            left,
                          },
                        }
                      : ps
                  ),
                }))
              } else {
                setclicks((prevState) => ({
                  ...prevState,
                  outry: prevState.outry.map((ps) =>
                    ps.id === draging
                      ? {
                          ...ps,
                          style: {
                            ...ps.style,
                            top,
                            left,
                          },
                        }
                      : ps
                  ),
                }))
              }
            }}
            onDragOver={(e) => {
              setNL({
                left: e.nativeEvent.offsetX,
                top: e.nativeEvent.offsetY,
              })
              e.stopPropagation()
              e.preventDefault()
            }}
          />
          {hasDraggable &&
            draggables.map((d) => (
              <RoadTag
                key={d.id}
                setting={{
                  ...d,
                  style: {
                    ...d.style,
                    width: hasRoadName ? '200px' : '35px',
                  },
                  content: (
                    <>
                      <FormLabel
                        className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded boxShadow"
                        style={{ pointerEvents: 'none' }}
                      >
                        {d.label}
                      </FormLabel>
                      {hasRoadName && (
                        <Form.Control
                          value={d.name}
                          name={d.id}
                          onChange={(e) =>
                            setdraggables((prevState) =>
                              prevState.map((ps) => ({
                                ...ps,
                                name:
                                  ps.id === parseInt(e.target.name, 10)
                                    ? e.target.value
                                    : ps.name,
                              }))
                            )
                          }
                        />
                      )}
                    </>
                  ),
                  draging,
                  setdraging,
                  hasRoadName,
                  setshowNL,
                }}
              />
            ))}
          {clicks.entry.map((e) => (
            <NumberTag
              key={e.id}
              setting={{
                ...e,
                handleDelete: () =>
                  setclicks((prevState) => ({
                    ...prevState,
                    entry: prevState.entry.filter((ps) => ps.id !== e.id),
                  })),
                draging,
                setdraging,
                setshowNL,
              }}
            />
          ))}
          {clicks.outry.map((o) => (
            <NumberTag
              key={o.id}
              setting={{
                ...o,
                handleDelete: () =>
                  setclicks((prevState) => ({
                    ...prevState,
                    outry: prevState.outry.filter((ps) => ps.id !== o.id),
                  })),
                setclicks,
                draging,
                setdraging,
                setshowNL,
              }}
            />
          ))}
        </div>
        <div className="w-25 ms-auto d-flex flex-column">
          <ButtonGroup>
            <Button
              className="my-2"
              variant="outline-dark"
              active={clicking === 'entry'}
              onClick={() => setclicking('entry')}
            >
              入口車道
            </Button>
            <Button
              className="my-2"
              variant="outline-dark"
              active={clicking === 'outry'}
              onClick={() => setclicking('outry')}
            >
              出口車道
            </Button>
          </ButtonGroup>
          <h6 style={{ top: '0' }} className="text-secondary pt-2">
            <FontAwesomeIcon icon={faCircleInfo} title="說明" />
            &ensp;請先選擇車道別，並拖曳東西南北輸入框至圖片上方；單擊滑鼠以數字標記，雙擊已標記之數字即可取消，或按「清除」重設全部。
          </h6>
          <Image className="mx-auto" height="auto" src={remark1} fluid />
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button
          variant="secondary"
          className="mx-2"
          onClick={() => {
            setdraggables(initDraggables)
            setclicks(initClicks)
          }}
        >
          清除
        </Button>
        <Button
          variant="revo2"
          className="mt-auto ms-2"
          onClick={() => handleClose({ draggables, clicks })}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Preview({ setting }) {
  const {
    show,
    handleClose,
    thumbnail,
    data,
    fixed,
    // roadLine = [],
    hasDraggable = false,
    hasRoadName = true,
  } = setting
  const initDraggables = [
    {
      id: 1,
      style: { width: '200px', top: '2%', left: '110%' },
      label: '東',
      name: '',
    },
    {
      id: 2,
      style: { width: '200px', top: '16%', left: '110%' },
      label: '西',
      name: '',
    },
    {
      id: 3,
      style: { width: '200px', top: '30%', left: '110%' },
      label: '南',
      name: '',
    },
    {
      id: 4,
      style: { width: '200px', top: '44%', left: '110%' },
      label: '北',
      name: '',
    },
  ]
  const [draggables, setdraggables] = useState(
    data ? data.draggables : initDraggables
  )

  const initClicks = {
    entry: [],
    outry: [],
  }
  const [clicks, setclicks] = useState(data ? data.clicks : initClicks)

  useEffect(() => {
    if (show) {
      setdraggables(data ? data.draggables : initDraggables)
      setclicks(data ? data.clicks : initClicks)
    }
  }, [show])

  const roadLine = useMemo(() => {
    if (!setting.roadLine) return []
    return setting.roadLine.map((r) => ({
      ...r,
      style: {
        ...r.style,
        left: (r.style.left / 75) * 49,
        top: (r.style.top / 75) * 49,
      },
    }))
  }, [setting.roadLine])
  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="xl"
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Header className="h5 text-revo" closeButton>
        預覽
      </Modal.Header>
      <Modal.Body className="d-flex">
        <div
          className="mx-auto"
          style={{
            width: '49%',
          }}
        >
          <h5 className="text-revo">方向與出入口標記</h5>
          <div className="position-relative w-100 flex-fill">
            <Image
              className="mx-auto w-100"
              src={`/api/draft/video/${thumbnail.name}`}
              fluid
            />
            {hasDraggable &&
              draggables
                .filter(
                  (d) => d.style && d.style.left && d.style.left !== '110%'
                )
                .map((d) => (
                  <RoadTag
                    key={d.id}
                    setting={{
                      ...d,
                      style: {
                        ...d.style,
                        width: hasRoadName ? '200px' : '35px',
                      },
                      content: (
                        <>
                          <FormLabel
                            className="align-self-center h-100 px-2 mb-0 text-light bg-revo rounded boxShadow"
                            style={{ pointerEvents: 'none' }}
                          >
                            {d.label}
                          </FormLabel>
                          <Form.Control
                            value={d.name}
                            name={d.id}
                            onChange={() => {}}
                          />
                        </>
                      ),
                      draging: 0,
                      setdraging: () => {},
                      draggable: false,
                    }}
                  />
                ))}
            {clicks.entry.map((e) => (
              <NumberTag
                key={e.id}
                setting={{
                  ...e,
                  handleDelete: () => {},
                  draging: 0,
                  setdraging: () => {},
                  draggable: false,
                }}
              />
            ))}
            {clicks.outry.map((o) => (
              <NumberTag
                key={o.id}
                setting={{
                  ...o,
                  handleDelete: () => {},
                  setclicks: () => {},
                  draging: 0,
                  setdraging: () => {},
                  draggable: false,
                }}
              />
            ))}
          </div>
        </div>
        {!hasDraggable && (
          <div
            className="d-flex flex-column ms-auto"
            style={{
              width: '49%',
            }}
          >
            <h5 className="text-revo">投影轉換結果與距離標記</h5>
            <div className="position-relative w-100 flex-fill">
              {fixed ? (
                <Image
                  // ref={imageRef}
                  style={{ cursor: 'pointer' }}
                  className="w-100"
                  height="auto"
                  src={`/api/draft/video/${fixed}`}
                  fluid
                />
              ) : (
                <div className="d-flex w-100 h-100 border">
                  <h5 className="m-auto text-revo-light text-center">
                    校正後路段
                  </h5>
                </div>
              )}
              {roadLine.map((point) => (
                <PointTag
                  key={point.id}
                  setting={{
                    ...point,
                    handleRemovePoint: () => {},
                    draging: 1,
                    setdraging: () => {},
                  }}
                />
              ))}
              {roadLine.length === 2 && (
                <hr
                  className="position-absolute text-warning"
                  style={{
                    border: '2px dashed #ffc107',
                    opacity: '1',
                    top:
                      (roadLine[0].style.top + roadLine[1].style.top) / 2 + 5,
                    left:
                      (roadLine[0].style.left + roadLine[1].style.left) / 2 -
                      Math.sqrt(
                        Math.abs(
                          roadLine[0].style.top - roadLine[1].style.top
                        ) **
                          2 +
                          Math.abs(
                            roadLine[0].style.left - roadLine[1].style.left
                          ) **
                            2
                      ) /
                        2 +
                      5,
                    width: Math.sqrt(
                      Math.abs(roadLine[0].style.top - roadLine[1].style.top) **
                        2 +
                        Math.abs(
                          roadLine[0].style.left - roadLine[1].style.left
                        ) **
                          2
                    ),
                    rotate: `${
                      90 -
                      (180 / Math.PI) *
                        Math.atan2(
                          roadLine[0].style.left - roadLine[1].style.left,
                          roadLine[0].style.top - roadLine[1].style.top
                        )
                    }deg`,
                  }}
                />
              )}
            </div>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button
          variant="revo2"
          className="mt-auto ms-2"
          onClick={() => handleClose()}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function VISSIMModal({ setting }) {
  const { show, handleClose } = setting
  const [access, setAccess] = useState('')
  const { setToast } = useContext(ToastContext)
  const downloadFilePost = async (target, param) => {
    const res = await apiServices.data({
      path: `vissim`,
      method: 'get',
      params: {
        access,
        target,
        ...param,
      },
      responseType: 'arraybuffer',
    })
    if (res.error) {
      setToast({ show: true, text: res.error })
      return
    }
    console.log(res)
    const blob = new Blob([res])
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', target)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <Modal
      style={{ zIndex: '1501' }}
      size="lg"
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Header className="h5 text-revo" closeButton>
        VISSIM_RL 程式碼生成器
      </Modal.Header>
      <Modal.Body className="text-center">
        <Row className="mb-3 d-flex">
          <p>請輸入驗證碼</p>
          <input
            className="w-50 mx-auto"
            type="text"
            value={access}
            onChange={(e) => setAccess(e.target.value)}
            defaultValue=""
          />
        </Row>
        <Row className="mb-3 justify-content-center">
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('setting.json', {})}
            >
              下載設定檔範本
            </Button>
          </Col>
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('setting_explain.txt', {})}
            >
              下載設定檔說明文件
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <p>上傳設定檔</p>
          <input
            className="mx-auto w-25"
            type="file"
            // onChange={setFileHandler}
          />
        </Row>
        <Row className="mb-3 justify-content-center">
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('train.py', {})}
            >
              下載 train.py
            </Button>
          </Col>
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('test.py', {})}
            >
              下載 test.py
            </Button>
          </Col>
        </Row>
        <div id="container" />
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-end">
        <Button
          variant="revo2"
          className="mt-auto ms-2"
          onClick={() => handleClose()}
        >
          確認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Road({ setting }) {
  const { handleToolChange } = setting

  const [showWarn, setshowWarn] = useState({
    show: false,
    content: 'Oops! 請先完成投影轉換再進行距離基準標記',
    handleClose: () => {},
  })
  const { timeId, time = {}, handleTimeEdit } = useContext(DraftContext)
  const { videos = [] } = time.setting || {}
  const [selected, setselected] = useState('')
  const {
    roads,
    roadAdjust,
    roadLine,
    fixed,
    thumbnail = {},
  } = videos[selected] || {}

  const handleDataChange = (data) => {
    handleTimeEdit(timeId, {
      videos: videos.map((v, i) => (i === selected ? { ...v, ...data } : v)),
    })
  }

  const [showDate, setshowDate] = useState(false)
  const [date, setdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  })
  const [data, setdata] = useState({
    originName: '',
    date: '',
    type: '路口',
  })
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })
  useEffect(() => {
    if (videos[selected]) {
      setdata({
        originName: videos[selected].originName || videos[selected].name || '',
        date: videos[selected].date || '',
        type: videos[selected].type || '路口',
      })
      setdate({
        startDate: videos[selected].date
          ? moment(videos[selected].date.split('-')[0]).toDate()
          : Date.now(),
        endDate: videos[selected].date
          ? moment(videos[selected].date.split('-')[1]).toDate()
          : Date.now(),
        key: 'selection',
      })
    }
  }, [selected])

  const [show, setshow] = useState(false)
  const [showPreview, setshowPreview] = useState(false)
  const [showProject, setshowProject] = useState(false)
  const [showLine, setshowLine] = useState(false)

  const form = [
    {
      name: 'originName',
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
        { label: '路口', name: 'type', value: '路口' },
        { label: '路段', name: 'type', value: '路段' },
      ],
    },
    {
      name: 'way',
      label: '車行方向',
      placeholder: '',
      type: 'road',
      check: roads,
      click: () => setshow(true),
      show: true,
    },
    {
      name: 'transform',
      label: '投影轉換',
      placeholder: '',
      type: 'road',
      check:
        roadAdjust &&
        roadAdjust.points &&
        roadAdjust.points.length === 4 &&
        roadAdjust.project &&
        roadAdjust.project.show,
      click: () => setshowProject(true),
      show: data.type === '路段',
    },
    {
      name: 'distance',
      label: '距離基準標記',
      placeholder: '',
      type: 'road',
      check: roadLine && roadLine.length === 2,
      click: () => {
        if (!fixed) {
          setshowWarn({
            ...showWarn,
            show: true,
            content: 'Oops! 請先完成投影轉換再進行距離基準標記',
            handleClose: () =>
              setshowWarn({
                ...showWarn,
                show: false,
              }),
            hasCancel: false,
          })
          return
        }
        setshowLine(true)
      },
      show: data.type === '路段',
    },
  ]

  const [showVISSIM, setshowVISSIM] = useState(false)
  const handleVISSIM = async (value) => {
    console.log(value)
    setshowVISSIM(!showVISSIM)
  }

  return (
    <>
      {selected !== '' ? (
        <Row className="flex-grow-1 pt-3 pb-5 px-4">
          <Col>
            {form.map((f, i) => {
              switch (f.type) {
                case 'project':
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={2}>
                          <Form.Label
                            className="mb-0"
                            style={{ letterSpacing: '31px' }}
                          >
                            {f.label}
                          </Form.Label>
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
                      {f.show && (
                        <Row className="py-3">
                          <Col xs={1} />
                          <Col
                            xs={3}
                            className="text-start pt-1 text-revo fw-bold"
                          >
                            <Form.Label className="mb-0">{f.label}</Form.Label>
                          </Col>
                          <Col className="pe-4">
                            <FontAwesomeIcon
                              className={`h5 mt-2 ${
                                f.check ? 'check-revo' : 'text-secondary'
                              }`}
                              style={{
                                cursor: 'pointer',
                              }}
                              icon={faCheckCircle}
                              onClick={f.click}
                            />
                          </Col>
                        </Row>
                      )}
                    </React.Fragment>
                  )
                case 'tab':
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={1} />
                        <Col
                          xs={2}
                          className="text-start pt-1 text-revo fw-bold"
                        >
                          <Form.Label
                            className="mb-0"
                            style={{ letterSpacing: '31px' }}
                          >
                            {f.label}
                          </Form.Label>
                        </Col>
                        <Col
                          xs={9}
                          className="text-start pt-1 text-revo fw-bold"
                        >
                          <Form.Select
                            className="w-100 h-100"
                            aria-label="Default select example"
                            onChange={(e) => {
                              if (e.target.value === '路口' && roads) {
                                setshowWarn({
                                  ...showWarn,
                                  show: true,
                                  content: `此影片已被標記為"路段"，
                                  更改選項會造成標記結果喪失，確定要修改嗎 ?`,
                                  handleClose: (value) => {
                                    if (value) {
                                      onDataChange({
                                        target: {
                                          name: 'type',
                                          value: '路口',
                                        },
                                      })
                                    }
                                    setshowWarn({
                                      ...showWarn,
                                      show: false,
                                    })
                                  },
                                  hasCancel: true,
                                })
                              } else if (e.target.value === '路段' && roads) {
                                setshowWarn({
                                  ...showWarn,
                                  show: true,
                                  content: `此影片已被標記為"路口"，
                                  更改選項會造成標記結果喪失，確定要修改嗎 ?`,
                                  handleClose: (value) => {
                                    if (value) {
                                      onDataChange({
                                        target: {
                                          name: 'type',
                                          value: '路段',
                                        },
                                      })
                                    }
                                    setshowWarn({
                                      ...showWarn,
                                      show: false,
                                    })
                                  },
                                  hasCancel: true,
                                })
                              } else {
                                onDataChange({
                                  target: {
                                    name: 'type',
                                    value: e.target.value,
                                  },
                                })
                              }
                            }}
                            value={data.type}
                          >
                            <option value="" className="d-none">
                              下拉選擇類型
                            </option>
                            {f.content.map((c, j) => (
                              <option key={j} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>
                    </React.Fragment>
                  )
                case 'date':
                  return (
                    <React.Fragment key={i}>
                      <Row className="pt-3 pb-2">
                        <Col xs={1} />
                        <Col
                          xs={2}
                          className="text-start pt-1 text-revo fw-bold"
                        >
                          <Form.Label
                            className="mb-0"
                            style={{ letterSpacing: '31px' }}
                          >
                            {f.label}
                          </Form.Label>
                        </Col>
                        <Col className="pe-4">
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
                              variant="revo"
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
                        <div className="ps-5 ms-5">
                          <div className="ps-5">
                            路口名稱格式：南北向路名＋東西向路名+路口，Ex.中正南平路口
                            <br />
                            路段名稱格式：路名＋路，Ex.中正路
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  )
                default:
                  return (
                    <React.Fragment key={i}>
                      <Row className="py-3">
                        <Col xs={1} />
                        <Col
                          xs={2}
                          className="text-start pt-1 text-revo fw-bold"
                        >
                          <Form.Label
                            className="mb-0"
                            style={{ letterSpacing: '31px' }}
                          >
                            {f.label}
                          </Form.Label>
                        </Col>
                        <Col className="pe-4">
                          <Form.Control
                            name={f.name}
                            type={f.type}
                            value={data[f.name]}
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
            {false && (
              <Row className="py-3">
                <Col xs={1} />
                <Col xs={2} className="text-start pt-1 text-revo fw-bold">
                  <Form.Label className="mb-0 text-nowrap">
                    VISSIM RL
                  </Form.Label>
                </Col>
                <Col className="pe-4 d-flex">
                  <Button
                    variant="revo2"
                    className="m-auto"
                    onClick={handleVISSIM}
                  >
                    生成
                  </Button>
                </Col>
              </Row>
            )}
          </Col>
          <Col className="d-flex flex-column">
            <video className="my-auto" width="95%" height="auto" controls>
              <track kind="captions" />
              <source src={`/api/time/video/${videos[selected]?.name}`} />
            </video>
            <div className="d-flex mt-auto me-4 pt-3">
              <Button
                variant="warning"
                className="ms-auto me-2"
                onClick={() => setshowPreview(true)}
              >
                預覽
              </Button>
              <Button
                variant="revo2"
                className="mx-2"
                onClick={() => {
                  handleDataChange(data)
                  handleToolChange({
                    target: {
                      name: 'step2',
                      value: 'selector',
                    },
                  })
                }}
              >
                確認
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <>
          <Row className="pt-3 pb-4 px-0">
            <Col xs={2}>
              <FormLabel htmlFor="file" className="text-revo fs-6 fw-bold">
                點擊以選擇影片
              </FormLabel>
            </Col>
          </Row>
          <Row
            className="pt-2 pb-5 px-4 border rounded mx-5"
            style={{ minHeight: '82%' }}
          >
            {videos && videos.length ? (
              videos.map(({ originName, ...v }, i) => (
                <Col
                  xs={3}
                  className="flex-column h5 text-revo"
                  key={originName || v.name}
                  style={{
                    cursor: 'pointer',
                  }}
                  onClick={() => setselected(i)}
                >
                  <p
                    style={{
                      height: '10%',
                    }}
                  >{`${i + 1}.${
                    originName ||
                    (v.name
                      ? v.name
                          .split('_')
                          .slice(1, v.name.split('_').length)
                          .join('')
                      : '- -')
                  }`}</p>
                  <div className="position-relative">
                    <div className="d-flex h-100">
                      <video
                        className="my-auto"
                        width="100%"
                        height="auto"
                        controls
                      >
                        <track kind="captions" />
                        <source src={`/api/draft/video/${v.name}`} />
                      </video>
                    </div>
                    <div
                      className="position-absolute p-2"
                      style={{
                        top: '-10%',
                        right: '-10%',
                      }}
                    >
                      <FontAwesomeIcon
                        className={`fs-1 ${
                          v.type &&
                          (v.type === '路口'
                            ? v.roads
                            : v.roads && v.roadAdjust && v.roadLine)
                            ? 'check-revo'
                            : 'text-secondary'
                        }`}
                        style={{
                          cursor: 'pointer',
                        }}
                        icon={faCheckCircle}
                        onClick={() => {}}
                      />
                    </div>
                  </div>
                </Col>
              ))
            ) : (
              <div className="d-flex ps-3">
                <h5 className="m-auto text-revo-light">目前尚無資料</h5>
              </div>
            )}
          </Row>
        </>
      )}
      {videos[selected] && (
        <>
          <RoadModal
            setting={{
              show,
              data: roads,
              thumbnail,
              handleClose: (value) => {
                if (value)
                  handleDataChange({
                    roads: value,
                  })
                setshow(false)
              },
              hasDraggable: data.type === '路口',
            }}
          />
          <ProjectedModal
            setting={{
              data: roadAdjust,
              show: showProject,
              thumbnail,
              handleClose: (value) => {
                if (value) handleDataChange(value)
                setshowProject(false)
              },
            }}
          />
          <LineModal
            setting={{
              data: roadLine,
              show: showLine,
              fixed,
              thumbnail,
              handleClose: (value) => {
                if (value) {
                  handleDataChange(value)
                }
                setshowLine(false)
              },
            }}
          />
          <Preview
            setting={{
              show: showPreview,
              data: roads,
              roadLine,
              fixed,
              thumbnail,
              handleClose: () => setshowPreview(false),
              hasDraggable: data.type === '路口',
            }}
          />
          <WarnModal
            setting={{
              ...showWarn,
            }}
          />
          <VISSIMModal
            setting={{
              show: showVISSIM,
              handleClose: handleVISSIM,
            }}
          />
        </>
      )}
    </>
  )
}

function Video({ setting }) {
  const { handleToolChange } = setting
  const { timeId, time = {}, setTimes } = useContext(DraftContext)
  const { videos = [] } = time.setting || {}

  // const [fileList, setfileList] = useState([])
  const [tempFile, settempFile] = useState(null)
  const tempurl = useMemo(
    () => (tempFile ? URL.createObjectURL(tempFile) : ''),
    [tempFile]
  )
  const [fileName, setfileName] = useState('')
  useEffect(() => {
    setfileName(tempFile ? tempFile.name : '')
  }, [tempFile])

  const [uploading, setuploading] = useState(false)
  const handleUpload = async () => {
    const formData = new FormData()
    formData.append('file', tempFile)
    const uploadedVideo = await apiServices.data({
      path: `time/file/${timeId}`,
      method: 'post',
      data: formData,
      contentType: 'multipart/form-data',
    })

    const snapshoter = new VideoSnapshot(tempFile)
    const previewSrc = await snapshoter.takeSnapshot()
    const base64ToArrayBuffer = (base64) => {
      const binaryString = atob(base64)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i += 1) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      return bytes.buffer
    }

    // const buffered = await Promise.all(files)
    const arrayed = [
      {
        name: `${fileName || tempFile.name}_thumbnail`,
        data: Array.from(
          new Uint8Array(base64ToArrayBuffer(previewSrc.split(',')[1]))
        ),
      },
    ]
    const res = await apiServices.data({
      path: `time/video/${timeId}`,
      method: 'post',
      data: {
        fileName,
        video: uploadedVideo,
        files: JSON.stringify(arrayed),
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
    setfileName('')
    setuploading(false)
  }
  const handleRemoveVideo = async (i) => {
    const res = await apiServices.data({
      path: `time/video/${timeId}/${i}`,
      method: 'delete',
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
  }
  return (
    <>
      <Row className="pt-3 pb-2 px-2" style={{ height: '10vh' }}>
        <Col xs={2}>
          <Button variant="revo">
            <FormLabel
              htmlFor="file"
              className="mb-0"
              style={{ cursor: 'pointer' }}
            >
              <FontAwesomeIcon icon={faFileArrowUp} />
              &ensp;上傳影片檔案
            </FormLabel>
          </Button>
          <Form.Control
            id="file"
            name="file"
            type="file"
            multiple
            accept="video/*"
            // value={fileList}
            onChange={(e) => {
              setuploading(true)
              settempFile(e.target.files[0])
              e.target.value = null
            }}
            style={{
              visibility: 'hidden',
            }}
          />
        </Col>
        <Col className="ps-0 pe-5">
          <Form.Control
            type="text"
            value={fileName}
            onChange={(e) => setfileName(e.target.value)}
          />
        </Col>
      </Row>
      <Row
        className="py-3 px-3 overflow-hidden border rounded mx-5"
        style={{ height: '82%' }}
      >
        {uploading ? (
          <>
            <Col xs={4}>
              <video width="auto" height="420px" controls>
                <track kind="captions" />
                <source src={tempurl} />
              </video>
            </Col>

            <Col xs={4} />
            <Col className="d-flex pb-1">
              <LoadingButton
                variant="revo2"
                className="mt-auto ms-auto me-2"
                onClick={handleUpload}
              >
                上傳
              </LoadingButton>
            </Col>
          </>
        ) : videos.length ? (
          <>
            {videos.map(({ originName, name }, i) => (
              <Col
                xs={3}
                className="d-flex flex-column h5 text-revo"
                key={originName || name}
              >
                <p
                  style={{
                    height: '10%',
                    marginBottom: '0',
                  }}
                >{`${`${i + 1} `}.${
                  originName ||
                  (name
                    ? name.split('_').slice(1, name.split('_').length).join('')
                    : '- -')
                }`}</p>
                <div className="d-flex h-100">
                  <video
                    className="my-auto"
                    width="100%"
                    height="auto"
                    controls
                  >
                    <track kind="captions" />
                    <source src={`/api/draft/video/${name}`} />
                  </video>
                </div>
                <Button
                  variant="outline-danger"
                  className="mb-auto mt-2 mx-auto"
                  size="sm"
                  onClick={() => handleRemoveVideo(i)}
                >
                  <FontAwesomeIcon icon={faTrashCan} />
                  &ensp;移除
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
  const { toolState, handleDataChange, handleToolChange } = setting
  const { time = {} } = useContext(DraftContext)
  const { videos = [], roads, roadLine, roadAdjust } = time.setting || {}
  const components = {
    selector: (
      <Row className="h-100 w-50 mx-auto px-5">
        {[
          {
            label: '影片上傳',
            name: 'step2',
            value: '影片上傳',
            check: videos.length !== 0,
            icon: faFileVideo,
          },
          {
            label: '路口＆路段標記',
            name: 'step2',
            value: '路口＆路段標記',
            icon: faLocationDot,
            check:
              videos &&
              videos.length &&
              videos.every((v) => {
                if (v.type === '路段') {
                  return v.roads && v.roadAdjust && v.roadLine
                }
                return v.roads
              }),
          },
          // {
          //   label: '車種標記',
          //   name: 'step2',
          //   value: '車種標記',
          //   icon: faCarRear,
          // },
          // {
          //   label: '軌跡標記',
          //   name: 'step2',
          //   value: '軌跡標記',
          //   icon: faArrowsToDot,
          // },
        ].map((s) => (
          <Col xs={6} className="d-flex px-3" key={s.value}>
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
                <FontAwesomeIcon
                  icon={s.icon}
                  className="fs-2 text-revo mx-auto mt-auto pb-3"
                />
                <div className="mx-auto mb-auto">{s.label}</div>
              </Card>
              <FontAwesomeIcon
                className={`h5 mt-2 ${
                  s.check ? 'check-revo' : 'text-secondary'
                }`}
                icon={faCheckCircle}
              />
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
    '路口＆路段標記': (
      <Road
        setting={{
          handleDataChange,
          handleToolChange,
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

Preview.propTypes = {
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

LabelTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

WarnModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

VISSIMModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step2
