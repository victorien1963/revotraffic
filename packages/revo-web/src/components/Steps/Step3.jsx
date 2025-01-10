/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState, useContext, useMemo, useRef } from 'react'
import PropTypes from 'prop-types'
import ExcelJS from 'exceljs'
import {
  Container,
  Row,
  Col,
  Button,
  FormLabel,
  Form,
  Image,
  Table,
  Modal,
  Spinner,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCaretLeft,
  faCheckCircle,
  faCaretRight,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { DraftContext, SocketContext, ToastContext } from '../ContextProvider'
import apiServices from '../../services/apiServices'

function WarnModal({ setting }) {
  const { show, handleClose } = setting

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
        <Row>
          <h4 className="text-center py-3 text-revo">
            Oops! 請先完成路口或路段標記
          </h4>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          className="mx-auto"
          style={{ boxShadow: 'none' }}
          variant="outline-revo2"
          onClick={handleClose}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

const defaultTrueValue = {
  0: {
    機車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    小客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    大客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
  },
  1: {
    機車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    小客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    大客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
  },
  2: {
    機車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    小客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    大客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
  },
  3: {
    機車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    小客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
    大客車: {
      左轉: '',
      直行: '',
      右轉: '',
    },
  },
}

function AccuracyTable({ setting }) {
  const { trueValue } = setting

  const result =
    setting.result && setting.result.length
      ? {
          0: {
            機車: {
              左轉: setting.result[3][11],
              直行: setting.result[4][11],
              右轉: setting.result[5][11],
            },
            小客車: {
              左轉: setting.result[3][12],
              直行: setting.result[4][12],
              右轉: setting.result[5][12],
            },
            大客車: {
              左轉: setting.result[3][13],
              直行: setting.result[4][13],
              右轉: setting.result[5][13],
            },
          },
          1: {
            機車: {
              左轉: setting.result[6][11],
              直行: setting.result[7][11],
              右轉: setting.result[8][11],
            },
            小客車: {
              左轉: setting.result[6][12],
              直行: setting.result[7][12],
              右轉: setting.result[8][12],
            },
            大客車: {
              左轉: setting.result[6][13],
              直行: setting.result[7][13],
              右轉: setting.result[8][13],
            },
          },
          2: {
            機車: {
              左轉: setting.result[9][11],
              直行: setting.result[10][11],
              右轉: setting.result[11][11],
            },
            小客車: {
              左轉: setting.result[9][12],
              直行: setting.result[10][12],
              右轉: setting.result[11][12],
            },
            大客車: {
              左轉: setting.result[9][13],
              直行: setting.result[10][13],
              右轉: setting.result[11][13],
            },
          },
          3: {
            機車: {
              左轉: setting.result[12][11],
              直行: setting.result[13][11],
              右轉: setting.result[14][11],
            },
            小客車: {
              左轉: setting.result[12][12],
              直行: setting.result[13][12],
              右轉: setting.result[14][12],
            },
            大客車: {
              左轉: setting.result[12][13],
              直行: setting.result[13][13],
              右轉: setting.result[14][13],
            },
          },
        }
      : {
          0: {
            機車: {
              左轉: '22',
              直行: '583',
              右轉: '93',
            },
            小客車: {
              左轉: '51',
              直行: '173',
              右轉: '45',
            },
            大客車: {
              左轉: '1',
              直行: '3',
              右轉: '1',
            },
          },
          1: {
            機車: {
              左轉: '104',
              直行: '961',
              右轉: '78',
            },
            小客車: {
              左轉: '93',
              直行: '650',
              右轉: '110',
            },
            大客車: {
              左轉: '3',
              直行: '38',
              右轉: '2',
            },
          },
          2: {
            機車: {
              左轉: '106',
              直行: '761',
              右轉: '87',
            },
            小客車: {
              左轉: '63',
              直行: '220',
              右轉: '67',
            },
            大客車: {
              左轉: '9',
              直行: '3',
              右轉: '1',
            },
          },
          3: {
            機車: {
              左轉: '72',
              直行: '513',
              右轉: '125',
            },
            小客車: {
              左轉: '40',
              直行: '529',
              右轉: '70',
            },
            大客車: {
              左轉: '1',
              直行: '24',
              右轉: '13',
            },
          },
        }

  const date =
    setting.result[1] && setting.result[1][1]
      ? setting.result[1][1]
      : '17:01:00-18:01:00'
  return (
    <div className="w-100 h-100 d-flex px-3">
      <div className="border-table w-100 h-100 d-flex flex-column">
        <Row>
          <Col xs={3}>{date}</Col>
          <Col xs={2} />
          <Col xs={3}>辨識結果</Col>
          {/* <Col>真值結果</Col> */}
          <Col>誤差</Col>
        </Row>
        <Row>
          <Col xs={3}>交叉路口</Col>
          <Col xs={1}>路口編號</Col>
          <Col xs={1}>方向</Col>
          <Col xs={1}>機車</Col>
          <Col xs={1}>小客車</Col>
          <Col xs={1}>大客車</Col>
          {/* <Col>機車</Col>
          <Col>小客車</Col>
          <Col>大客車</Col> */}
          <Col>機車</Col>
          <Col>小客車</Col>
          <Col>大客車</Col>
        </Row>
        <Row className="flex-fill">
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row>路口直向</Row>
            <Row>{setting.result[4][2]}</Row>
            <Row>2</Row>
          </Col>
          <Col xs={1}>
            <Row />
            <Row>N↓</Row>
            <Row />
          </Col>
          <Col xs={1}>{setting.result[4][4]}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[0]).map((key) => (
            <Col key={key} xs={1}>
              {Object.keys(result[0][key]).map((way) => (
                <Row key={way}>{result[0][key][way]}</Row>
              ))}
            </Col>
          ))}
          {['機車', '小客車', '大客車'].map((key) => (
            <Col key={key} xs={1} className="flex-grow-1">
              {['左轉', '直行', '右轉'].map((way) => {
                const dif = trueValue[0][key][way]
                  ? (result[0][key][way] - trueValue[0][key][way]).toFixed(2)
                  : ''
                const pdif = result[0][key][way]
                  ? (dif / result[0][key][way]) * 100
                  : 0
                return trueValue[0][key][way] ? (
                  <Row key={way} className="w-100 flex-nowrap ms-0">
                    <Col
                      xs={4}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {dif}
                    </Col>
                    <Col
                      xs={8}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {`${pdif.toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row key={way} />
                )
              })}
            </Col>
          ))}
        </Row>
        <Row className="flex-fill">
          <Col xs={1}>
            <Row>路口橫向</Row>
            <Row>{setting.result[6][1]}</Row>
            <Row>1</Row>
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row>{setting.result[6][3]}</Row>
            <Row>3</Row>
          </Col>
          <Col xs={1}>{setting.result[6][4]}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[1]).map((key) => (
            <Col key={key} xs={1}>
              {Object.keys(result[1][key]).map((way) => (
                <Row key={way}>{result[1][key][way]}</Row>
              ))}
            </Col>
          ))}
          {['機車', '小客車', '大客車'].map((key) => (
            <Col key={key} xs={1} className="flex-grow-1">
              {['左轉', '直行', '右轉'].map((way) => {
                const dif = trueValue[1][key][way]
                  ? (result[1][key][way] - trueValue[1][key][way]).toFixed(2)
                  : ''
                const pdif = result[1][key][way]
                  ? (dif / result[1][key][way]) * 100
                  : 0
                return trueValue[1][key][way] ? (
                  <Row key={way} className="w-100 flex-nowrap ms-0">
                    <Col
                      xs={4}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {dif}
                    </Col>
                    <Col
                      xs={8}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {`${pdif.toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row key={way} />
                )
              })}
            </Col>
          ))}
        </Row>
        <Row className="flex-fill">
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row>{setting.result[8][2]}</Row>
            <Row>4</Row>
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>{setting.result[8][4]}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[2]).map((key) => (
            <Col key={key} xs={1}>
              {Object.keys(result[2][key]).map((way) => (
                <Row key={way}>{result[2][key][way]}</Row>
              ))}
            </Col>
          ))}
          {['機車', '小客車', '大客車'].map((key) => (
            <Col key={key} xs={1} className="flex-grow-1">
              {['左轉', '直行', '右轉'].map((way) => {
                const dif = trueValue[2][key][way]
                  ? (result[2][key][way] - trueValue[2][key][way]).toFixed(2)
                  : ''
                const pdif = result[2][key][way]
                  ? (dif / result[2][key][way]) * 100
                  : 0
                return trueValue[2][key][way] ? (
                  <Row key={way} className="w-100 flex-nowrap ms-0">
                    <Col
                      xs={4}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {dif}
                    </Col>
                    <Col
                      xs={8}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {`${pdif.toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row key={way} />
                )
              })}
            </Col>
          ))}
        </Row>
        <Row className="flex-fill">
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>{setting.result[10][4]}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[3]).map((key) => (
            <Col key={key} xs={1}>
              {Object.keys(result[3][key]).map((way) => (
                <Row key={way}>{result[3][key][way]}</Row>
              ))}
            </Col>
          ))}
          {['機車', '小客車', '大客車'].map((key) => (
            <Col key={key} xs={1} className="flex-grow-1">
              {['左轉', '直行', '右轉'].map((way) => {
                const dif = trueValue[3][key][way]
                  ? (result[3][key][way] - trueValue[0][key][way]).toFixed(2)
                  : ''
                const pdif = result[3][key][way]
                  ? (dif / result[3][key][way]) * 100
                  : 0
                return trueValue[3][key][way] ? (
                  <Row key={way} className="w-100 flex-nowrap ms-0">
                    <Col
                      xs={4}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {dif}
                    </Col>
                    <Col
                      xs={8}
                      className={`px-0 text-nowrap ${
                        Math.abs(pdif) > 10 ? 'text-danger' : ''
                      }`}
                    >
                      {`${pdif.toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row key={way} />
                )
              })}
            </Col>
          ))}
        </Row>
      </div>
    </div>
  )
}

function CheckTable({ setting }) {
  const { options } = setting
  const [checked, setchecked] = useState([])
  useEffect(() => {
    setchecked(options.map(() => true))
  }, [])
  const handleCheck = (i) =>
    setchecked(checked.map((c, j) => (i === j ? !c : c)))
  const handleCheckAll = () =>
    setchecked(
      checked.every((c) => c)
        ? checked.map(() => false)
        : checked.map(() => true)
    )
  return (
    <Container className="h-75 d-flex flex-column px-5 py-3">
      <Row className="flex-grow-1" onClick={handleCheckAll}>
        <Col xs={2} className="border d-flex">
          {checked.every((c) => c) && (
            <FontAwesomeIcon
              className="m-auto"
              style={{
                cursor: 'pointer',
              }}
              icon={faCheckCircle}
            />
          )}
        </Col>
        <Col className="border d-flex">
          <p className="m-auto">全選</p>
        </Col>
      </Row>
      {options.map((option, i) => (
        <Row
          key={option.label}
          className="flex-grow-1"
          onClick={() => handleCheck(i)}
        >
          <Col xs={2} className="border d-flex">
            {checked[i] && (
              <FontAwesomeIcon
                className="m-auto"
                style={{
                  cursor: 'pointer',
                  color: option.label ? 'black' : 'transparent',
                }}
                icon={faCheckCircle}
              />
            )}
          </Col>
          <Col xs={10} className="border d-flex">
            <p
              className="m-auto w-100 overflow-hidden"
              style={{
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {option.label}
            </p>
          </Col>
        </Row>
      ))}
    </Container>
  )
}

function Step3({ setting }) {
  const { toolState, handleToolChange } = setting
  const {
    timeId,
    time = {},
    times,
    setTimes,
    handleTimeEdit = () => {},
  } = useContext(DraftContext)
  const { setToast } = useContext(ToastContext)

  const { videos = [] } = time.setting || {}
  const [selectedVideo, setselectedVideo] = useState(null)
  const videoData = useMemo(
    () => (selectedVideo !== null ? videos[selectedVideo] || {} : {}),
    [selectedVideo, videos]
  )

  const [videoStatus, setvideoStatus] = useState({
    status: '',
    message: '',
  })
  const [result, setresult] = useState(null)
  const [resultCarSpacing, setresultCarSpacing] = useState(null)
  const [resultSpeed, setresultSpeed] = useState(null)
  const [src, setsrc] = useState('')
  const [vwSrc, setvwSrc] = useState('')
  const [trackMap, settrackMap] = useState([])
  useEffect(() => {
    if (!videoData) return
    if (videoData.result) {
      const workbook = new ExcelJS.Workbook()
      try {
        workbook.xlsx
          .load(videoData.result.data || videoData.result)
          .then((sheets) => {
            const sheet = sheets.worksheets[0]
            if (sheet) {
              const table = []
              sheet.eachRow((row) => {
                const temp = []
                row.eachCell({ includeEmpty: true }, (cell) => {
                  temp.push(cell.value)
                })
                table.push(temp)
              })
              setresult(table)
            }
          })
      } catch (e) {
        console.log(e)
      }
    } else setresult(null)
    if (videoData.resultCarSpacing) {
      try {
        const csv = videoData.resultCarSpacing
          .split('\n')
          .map((row) => row.split(','))
        setresultCarSpacing(csv)
      } catch (e) {
        console.log(e)
      }
    } else setresultCarSpacing(null)
    if (videoData.resultSpeed) {
      try {
        const csv = videoData.resultSpeed
          .split('\n')
          .map((row) => row.split(','))
        setresultSpeed(csv)
      } catch (e) {
        console.log(e)
      }
    } else setresultSpeed(null)
    if (videoData.result_video) {
      setsrc(`/api/draft/video/${videoData.result_video.name}`)
    } else setsrc(null)
    if (videoData.result_video_warp) {
      setvwSrc(`/api/draft/video/${videoData.result_video_warp.name}`)
    } else setvwSrc(null)
    if (videoData.result_track_maps && !videoData.result_track_maps.error) {
      settrackMap(videoData.result_track_maps)
    } else settrackMap([])
  }, [videoData])

  const [selected, setselected] = useState('')
  const { socket, sendMessage } = useContext(SocketContext)
  useEffect(() => {
    if (!socket) return
    socket.on('video', (message) => {
      setTimes(times.map((t) => (t.time_id === message.time_id ? message : t)))
      setvideoStatus({
        ...videoStatus,
        status: 'success',
      })
    })
    socket.on('video_status', (message) => {
      setvideoStatus(message)
      if (message.message) setToast({ show: true, text: message.message })
    })
  }, [socket])

  const [showWarn, setshowWarn] = useState(false)
  const startProgress = () => {
    const { type, roads, roadLine, roadAdjust } = videoData
    const ready = type === '路段' ? roads && roadLine && roadAdjust : roads
    if (!ready) {
      setshowWarn(true)
      return
    }
    sendMessage('video', {
      timeId,
      target: selectedVideo,
    })
  }

  // true value
  const [show, setshow] = useState(false)
  const [trueValue, settrueValue] = useState(defaultTrueValue)
  useEffect(
    () => settrueValue(videoData.trueValue?.traffic15 || defaultTrueValue),
    [videoData, selected]
  )

  // page
  const [tempPage, settempPage] = useState(1)
  const [page, setpage] = useState(1)
  useEffect(() => {
    settempPage(page)
  }, [page])

  const optionComponent = {
    每15分鐘各方向交通量: (
      <AccuracyTable
        setting={{
          result,
          trueValue,
        }}
      />
    ),
    每小時各方向交通量: (
      <AccuracyTable
        setting={{
          result,
          trueValue,
        }}
      />
    ),
    '軌跡辨識與轉向 (視覺化)': (
      <Row className="position-relative h-100">
        <Image
          className="mx-auto py-3"
          style={{
            maxWidth: '95%',
            maxHeight: '100%',
            height: 'auto',
            width: 'auto',
          }}
          src={`data:image/png;base64, ${trackMap[page - 1]}`}
          fluid
        />
        <div
          className="position-absolute d-flex justify-content-center"
          style={{
            height: '50px',
            bottom: '-55px',
          }}
        >
          <Form.Control
            className="h-50 mx-1"
            type="phone"
            style={{
              width: '55px',
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                if (!Number.isNaN(event.target.value))
                  setpage(
                    Math.max(Math.min(event.target.value, trackMap.length), 1)
                  )
              }
            }}
            onBlur={(event) => {
              if (!Number.isNaN(event.target.value))
                setpage(
                  Math.max(Math.min(event.target.value, trackMap.length), 1)
                )
            }}
            onChange={(e) => {
              settempPage(e.target.value)
            }}
            value={tempPage}
          />{' '}
          / {trackMap.length}
        </div>
        <a
          className="carousel-control-prev"
          role="button"
          tabIndex="0"
          onClick={() => setpage(Math.max(1, page - 1))}
          href="#"
        >
          <FontAwesomeIcon
            style={{
              fontSize: '4rem',
            }}
            className="px-0 my-auto text-revo"
            icon={faCaretLeft}
            title="上一張"
          />
        </a>
        <a
          className="carousel-control-next"
          role="button"
          tabIndex="0"
          onClick={() => setpage(Math.min(trackMap.length, page + 1))}
          href="#"
        >
          <FontAwesomeIcon
            style={{
              fontSize: '4rem',
            }}
            className="px-0 my-auto text-revo"
            icon={faCaretRight}
            title="下一張"
          />
        </a>
      </Row>
    ),
    // 期望加減速率: <SpeedTable />,
    期望加減速率: resultSpeed ? (
      <Table bordered responsive>
        <tbody>
          {resultSpeed.map((row, i) => (
            <tr key={i}>
              {row.map((r, j) => (
                <td key={`${i}_${j}`}>{r}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    ) : (
      <h5>未產生本類型結果</h5>
    ),
    '車間距（計算量）': resultCarSpacing ? (
      <Table bordered responsive>
        <tbody>
          {resultCarSpacing
            .filter((row) => row.length > 1)
            .map((row, i) => (
              <tr key={i}>
                {row.map((r, j) => (
                  <td key={`${i}_${j}`}>{r}</td>
                ))}
              </tr>
            ))}
        </tbody>
      </Table>
    ) : (
      <h5>未產生本類型結果</h5>
    ),
    '車間距（視覺化）': (
      <video width="auto" height="100%" controls>
        <track kind="captions" />
        <source src={vwSrc} />
      </video>
    ),
    '車輛辨識與追蹤（視覺化）': (
      <video width="auto" height="100%" controls>
        <track kind="captions" />
        <source src={src} />
      </video>
    ),
  }
  useEffect(() => {
    setselected('')
  }, [selectedVideo])

  const videoRef = useRef(null)
  useEffect(() => {
    videoRef.current?.load()
  }, [videoData])

  const components = {
    影像辨識: (
      <Row className="h-100">
        <Col xs={4} className="pe-0">
          <div className="w-100 h-100 d-flex flex-column px-3">
            <FormLabel className="text-revo fw-bold text-start">
              （1） 選擇分析影片
            </FormLabel>
            <div className="d-flex w-100">
              <Form.Select
                className="mx-auto mb-3 mt-3"
                aria-label="Default select example"
                onChange={(e) => setselectedVideo(e.target.value)}
                value={selectedVideo}
              >
                <option value="" className="d-none">
                  選擇影片
                </option>
                {videos.map(({ originName, name }, i) => (
                  <option key={originName || name} value={i}>
                    {originName || name}
                  </option>
                ))}
              </Form.Select>
              <Button
                variant="revo"
                className="my-auto ms-2 w-30 text-nowrap"
                onClick={startProgress}
                disabled={!selectedVideo}
              >
                {videoStatus.status &&
                !['success', 'error'].includes(videoStatus.status) ? (
                  <Spinner size="sm" />
                ) : (
                  '執行辨識'
                )}
              </Button>
            </div>
            {videoData.name && (
              <video
                ref={videoRef}
                className="mt-3"
                width="100%"
                height="auto"
                controls
              >
                <track kind="captions" />
                <source src={`/api/draft/video/${videoData.name}`} />
              </video>
            )}
          </div>
        </Col>
        <Col xs={6} className="h-100 ps-0">
          <div className="w-100 h-100 d-flex flex-column px-0 overflow-hidden">
            <FormLabel className="text-revo fw-bold text-start">
              （2） 選擇辨識結果
            </FormLabel>
            <div className="d-flex w-100">
              <Form.Select
                className="w-100 mb-3 mt-3"
                aria-label="Default select example"
                onChange={(e) => setselected(e.target.value)}
                value={selected}
                disabled={!selectedVideo || !videoData || !result}
              >
                <option value="" className="d-none">
                  下拉檢視辨識結果
                </option>
                {[
                  {
                    label:
                      videoData.type === '路口'
                        ? '每15分鐘各方向交通量'
                        : '每15分鐘各方向交通量（路段影像不適用）',
                    disabled: videoData.type === '路段',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '每小時各方向交通量'
                        : '每小時各方向交通量（路段影像不適用）',
                    disabled: videoData.type === '路段',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '軌跡辨識與轉向 (視覺化)'
                        : '軌跡辨識與轉向 (視覺化)（路段影像不適用）',
                    disabled: videoData.type === '路段',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '期望加減速率（路口影像不適用）'
                        : '期望加減速率',
                    disabled: videoData.type === '路口',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '車間距（視覺化）（路口影像不適用）'
                        : '車間距（視覺化）',
                    disabled: videoData.type === '路口',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '車間距（計算量）（路口影像不適用）'
                        : '車間距（計算量）',
                    disabled: videoData.type === '路口',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '車輛辨識與追蹤（視覺化）'
                        : '車輛辨識與追蹤（視覺化）(路段影像不適用)',
                    disabled: videoData.type === '路段',
                  },
                ].map((c, i) => (
                  <option key={i} value={c.label} disabled={c.disabled}>
                    {c.label}
                  </option>
                ))}
              </Form.Select>
              {['每15分鐘各方向交通量', '每小時各方向交通量'].includes(
                selected
              ) && (
                <Button
                  variant="revo"
                  className="my-auto ms-2 w-30 text-nowrap"
                  onClick={() => setshow(true)}
                >
                  輸入真值
                </Button>
              )}
            </div>
            <div className="h-70 w-100 overflow-show">
              {optionComponent[selected] || <div />}
            </div>
          </div>
        </Col>
        <Col xs={2} className="ps-0">
          <FormLabel className="text-revo w-100 fw-bold text-start">
            （3） 匯出與確認
          </FormLabel>
          <div className="w-100 h-100 d-flex flex-column pe-2 pt-3">
            <div className="d-flex w-100 ps-3">
              <Button
                variant="revo2"
                className="text-nowrap"
                onClick={async () => {
                  switch (selected) {
                    case '車輛辨識與追蹤（視覺化）':
                    case '車間距（視覺化）':
                      if (videoData && videoData.result_video) {
                        const res = await apiServices.data({
                          path: `/draft/video/${videoData.result_video.name}`,
                          method: 'get',
                          responseType: 'arraybuffer',
                        })
                        const blob = new Blob([res])
                        const link = document.createElement('a')
                        link.setAttribute('href', URL.createObjectURL(blob))
                        link.setAttribute('download', 'result.mp4')
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                      }
                      break
                    case '每15分鐘各方向交通量':
                    case '每小時各方向交通量':
                      if (videoData && videoData.result) {
                        const workbook = new ExcelJS.Workbook()
                        const book = await workbook.xlsx.load(
                          videoData.result.data || videoData.result
                        )
                        const sheet = book.worksheets[0]
                        sheet.spliceColumns(15, 6)
                        const file = await workbook.xlsx.writeBuffer({
                          base64: true,
                        })
                        const blob = new Blob([file], {
                          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                        })
                        const objectUrl = URL.createObjectURL(blob)
                        const link = document.createElement('a')
                        link.setAttribute('href', objectUrl)
                        link.setAttribute(
                          'download',
                          `${videoData.name}_result.xlsx`
                        )
                        document.body.appendChild(link)
                        link.click()
                        link.remove()
                      }
                      break
                    default:
                      break
                  }
                }}
              >
                匯出
              </Button>
              {/* <Button
                variant="revo"
                className="text-nowrap ms-2"
                onClick={() =>
                  handleToolChange({
                    target: {
                      name: 'step4',
                      value: 'selector',
                    },
                  })
                }
              >
                {selected === '每小時各方向交通量' ? '交通量檢核' : '確認'}
              </Button> */}
            </div>
          </div>
        </Col>
      </Row>
    ),
  }

  return (
    <>
      <Container
        className="h-100 d-flex flex-column overflow-hidden px-4"
        fluid
      >
        {components[toolState.step3]}
      </Container>
      <WarnModal
        setting={{
          show: showWarn,
          handleClose: () => {
            handleToolChange({
              target: {
                name: 'step2',
                value: '路口＆路段標記',
              },
            })
          },
        }}
      />
      <Modal size="xl" show={show} onHide={() => setshow(false)}>
        <Modal.Header closeButton>
          <h4>輸入真值</h4>
        </Modal.Header>
        <Modal.Body>
          <div className="border-table h-100 d-flex flex-column">
            <Row>
              <Col xs={3}>17:01:00-18:01:00</Col>
              <Col xs={2} />
              <Col>真值結果</Col>
            </Row>
            <Row>
              <Col xs={3}>交叉路口</Col>
              <Col xs={1}>路口編號</Col>
              <Col xs={1}>方向</Col>
              <Col>機車</Col>
              <Col>小客車</Col>
              <Col>大客車</Col>
            </Row>
            <Row className="flex-fill">
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row>路口直向</Row>
                <Row>{result && result[4] ? result[4][2] : ''}</Row>
              </Col>
              <Col xs={1}>
                <Row />
                <Row>N↓</Row>
                <Row />
              </Col>
              <Col xs={1}>1</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {['機車', '小客車', '大客車'].map((key) => (
                <Col key={key}>
                  {['左轉', '直行', '右轉'].map((way) => (
                    <Row key={way} className="px-3">
                      <Form.Control
                        value={trueValue[0][key][way]}
                        onChange={(e) =>
                          settrueValue((prevState) => ({
                            ...prevState,
                            0: {
                              ...prevState[0],
                              [key]: {
                                ...prevState[0][key],
                                [way]: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Col>
              ))}
            </Row>
            <Row className="flex-fill">
              <Col xs={1}>
                <Row>路口橫向</Row>
                <Row>{result && result[6] ? result[6][1] : ''}</Row>
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row>{result && result[6] ? result[6][3] : ''}</Row>
                <Row />
              </Col>
              <Col xs={1}>2</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {['機車', '小客車', '大客車'].map((key) => (
                <Col key={key}>
                  {['左轉', '直行', '右轉'].map((way) => (
                    <Row key={way} className="px-3">
                      <Form.Control
                        value={trueValue[1][key][way]}
                        onChange={(e) =>
                          settrueValue((prevState) => ({
                            ...prevState,
                            1: {
                              ...prevState[1],
                              [key]: {
                                ...prevState[1][key],
                                [way]: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Col>
              ))}
            </Row>
            <Row className="flex-fill">
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row>{result && result[8] ? result[8][2] : ''}</Row>
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>3</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {['機車', '小客車', '大客車'].map((key) => (
                <Col key={key}>
                  {['左轉', '直行', '右轉'].map((way) => (
                    <Row key={way} className="px-3">
                      <Form.Control
                        value={trueValue[2][key][way]}
                        onChange={(e) =>
                          settrueValue((prevState) => ({
                            ...prevState,
                            2: {
                              ...prevState[2],
                              [key]: {
                                ...prevState[2][key],
                                [way]: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Col>
              ))}
            </Row>
            <Row className="flex-fill">
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row>G10-3</Row>
                <Row>攝影機</Row>
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>4</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {['機車', '小客車', '大客車'].map((key) => (
                <Col key={key}>
                  {['左轉', '直行', '右轉'].map((way) => (
                    <Row key={way} className="px-3">
                      <Form.Control
                        value={trueValue[3][key][way]}
                        onChange={(e) =>
                          settrueValue((prevState) => ({
                            ...prevState,
                            3: {
                              ...prevState[3],
                              [key]: {
                                ...prevState[3][key],
                                [way]: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Row>
                  ))}
                </Col>
              ))}
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="text-nowrap ms-auto"
            onClick={() => setshow(false)}
          >
            取消
          </Button>
          <Button
            variant="revo"
            className="text-nowrap"
            onClick={() => {
              handleTimeEdit(timeId, {
                videos: videos.map((v, i) =>
                  i === parseInt(selectedVideo, 10)
                    ? {
                        ...v,
                        trueValue: {
                          traffic15: trueValue,
                        },
                      }
                    : v
                ),
              })
              setshow(false)
            }}
          >
            確定
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

Step3.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

AccuracyTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

WarnModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step3
