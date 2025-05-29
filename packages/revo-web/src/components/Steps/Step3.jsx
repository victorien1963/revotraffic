/* eslint-disable no-param-reassign */
/* eslint-disable no-nested-ternary */
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
import { path3, path4, path5 } from '../../assets'
import { DraftContext, SocketContext, ToastContext } from '../ContextProvider'
import apiServices from '../../services/apiServices'
import { usePermissions } from '../../hooks/useRoleAndPermission'

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

function AccuracyTable({ setting }) {
  const { trueValue } = setting
  console.log(trueValue)
  const imgs = {
    3: path3,
    4: path4,
    5: path5,
  }
  const roadNum =
    setting.result.length - 7 === 6
      ? 3
      : setting.result.length - 7 === 12
      ? 4
      : 5
  return (
    <div className="w-100 h-100 d-flex px-3">
      <div className="border-table w-100 h-100 d-flex flex-column position-relative">
        <Image
          className="position-absolute"
          width="30%"
          style={{ left: '14%', top: '20%' }}
          src={imgs[roadNum]}
        />
        {(setting.result || []).map((sr, i) => (
          <Row key={i}>
            {sr.slice(1, 15).map((r, j) => {
              const notnumber = Number.isNaN(parseFloat(r))
              const before = j > 1 && r === sr[j] && notnumber
              const after = sr[j + 2] && r === sr[j + 2] && notnumber
              const isControl = j > 10 && i > 2

              const className =
                j > 2 || i < 3
                  ? `border-top border-bottom ${before ? '' : 'border-start'} ${
                      after ? '' : 'border-end'
                    }`
                  : ``
              const empty = !(j > 2 || i < 3)

              return (
                <Col xs={2} className={className} key={j}>
                  {isControl ? (
                    <Row className="flex-nowrap">
                      <Col xs={6}>
                        {trueValue[i] && trueValue[i][j]
                          ? parseFloat(sr[j - 2]) - parseFloat(trueValue[i][j])
                          : ''}
                      </Col>
                      <Col xs={6}>
                        {trueValue[i] && trueValue[i][j]
                          ? `${(
                              ((parseFloat(sr[j - 2]) -
                                parseFloat(trueValue[i][j])) /
                                parseFloat(trueValue[i][j])) *
                              100
                            ).toFixed(0)}%`
                          : ''}
                      </Col>
                    </Row>
                  ) : (
                    <p className="text-nowrap">
                      {before || empty
                        ? ''
                        : r === '請綠線協助填寫'
                        ? '真值'
                        : r && r.replace
                        ? r.replace('每小時', '')
                        : r}
                    </p>
                  )}
                </Col>
              )
            })}
          </Row>
        ))}
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
    draft,
  } = useContext(DraftContext)
  const { setToast } = useContext(ToastContext)
  const { hasPermission } = usePermissions()

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
  const [trueValue, settrueValue] = useState({})
  useEffect(() => {
    const t = videoData.trueValue?.traffic15
    if (t && !t.length) {
      settrueValue(t)
    }
  }, [videoData, selected])

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
    各方向交通量: (
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
                disabled={!hasPermission('editProject', draft.draft_user_role)}
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
                disabled={
                  !selectedVideo ||
                  !hasPermission('editProject', draft.draft_user_role)
                }
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
                disabled={
                  !selectedVideo ||
                  !videoData ||
                  !result ||
                  !hasPermission('editProject', draft.draft_user_role)
                }
              >
                <option value="" className="d-none">
                  下拉檢視辨識結果
                </option>
                {[
                  {
                    label:
                      videoData.type === '路口'
                        ? '各方向交通量'
                        : '各方向交通量（路段影像不適用）',
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
              {[
                '每15分鐘各方向交通量',
                '每小時各方向交通量',
                '各方向交通量',
              ].includes(selected) && (
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
                    case '各方向交通量':
                      if (videoData && videoData.result) {
                        const workbook = new ExcelJS.Workbook()
                        const book = await workbook.xlsx.load(
                          videoData.result.data || videoData.result
                        )
                        const sheet = book.worksheets[0]
                        sheet.spliceColumns(16, 6)
                        sheet.eachRow((row, rowNumber) => {
                          console.log(
                            `Row ${rowNumber} = ${JSON.stringify(row.values)}`
                          )
                          row.eachCell((cell, cellNumber) => {
                            if (cell.value === '請綠線協助填寫') {
                              cell.value = '真值'
                            } else if (
                              cell.value === '每小時於路口前停等的時間(秒)' ||
                              cell.value === '每小時通過路口的數量'
                            ) {
                              cell.value = cell.value.replace('每小時', '')
                            } else if (
                              cellNumber >= 10 &&
                              cellNumber < 13 &&
                              rowNumber >= 5
                            ) {
                              if (
                                trueValue[rowNumber - 2] &&
                                trueValue[rowNumber - 2][cellNumber + 1]
                              ) {
                                const dif =
                                  parseFloat(cell.value) -
                                  parseFloat(
                                    trueValue[rowNumber - 2][cellNumber + 1]
                                  )
                                const percent = (
                                  (dif /
                                    parseFloat(
                                      trueValue[rowNumber - 2][cellNumber + 1]
                                    )) *
                                  100
                                ).toFixed(0)
                                row.getCell(
                                  cellNumber + 3
                                ).value = `${dif} ${percent}%`
                              }
                            }
                          })
                          console.log(row.getCell(10).value)
                        })
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
                disabled={!hasPermission('editProject', draft.draft_user_role)}
              >
                匯出
              </Button>
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
          <div className="border-table-high w-100 h-100 d-flex flex-column">
            {(result || []).map((sr, i) => (
              <Row key={i}>
                {sr.slice(1, 15).map((r, j) => {
                  const notnumber = Number.isNaN(parseFloat(r))
                  const before = j > 1 && r === sr[j - 1] && notnumber
                  console.log(sr[j - 1])
                  console.log(sr[j])
                  console.log(notnumber)
                  console.log(before)
                  const after = sr[j + 1] && r === sr[j + 1] && notnumber
                  const isControl = j > 10 && i > 2
                  const text = r === '誤差' ? '真值' : r
                  return (
                    <Col
                      xs={2}
                      className={`border-top border-bottom ${
                        before ? '' : 'border-start'
                      } ${after ? '' : 'border-end'}`}
                      key={j}
                    >
                      {isControl ? (
                        <Form.Control
                          value={trueValue[i] ? trueValue[i][j] : ''}
                          onChange={(e) =>
                            settrueValue((prevState) => ({
                              ...prevState,
                              [i]: {
                                ...(trueValue[i] || {}),
                                [j]: e.target.value,
                              },
                            }))
                          }
                        />
                      ) : (
                        <p className="text-nowrap">{before ? '' : text}</p>
                      )}
                    </Col>
                  )
                })}
              </Row>
            ))}
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
