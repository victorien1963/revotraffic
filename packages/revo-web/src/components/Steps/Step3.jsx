/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
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
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { DraftContext } from '../ContextProvider'
import {
  camera14,
  camera7projection,
  gallery1,
  gallery2,
  gallery3,
  gallery4,
  gallery5,
  gallery6,
  gallery7,
  // turning,
} from '../../assets'

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

function SpeedTable() {
  const result = [
    ['1.25461803281359', '0.301129160269795', '8.6948798106613'],
    ['1.82005253118489', '0.300347873944984', '9.9389992337925'],
    ['3.42607483534419', '0.301118844606688', '9.47823468375696'],
    ['4.32605083532848', '0.309979938830038', '10.2952546918134'],
    ['5.05740903868158', '0.303420175730289', '10.8777690744131'],
    ['1.22491390814632', '0.31440543552304', '8.46606946927862'],
    ['0.820256322986837', '0.34167361421527', '3.31530632154377'],
    [],
    [],
  ]

  return (
    <div className="w-100 h-100 d-flex px-2">
      <div
        className="border-table h-100 d-flex flex-column mx-auto"
        style={{
          width: '97%',
        }}
      >
        <Row className="w-100">
          <Col xs={3}>X</Col>
          <Col xs={3}>Y</Col>
          <Col xs={3}>Ymin</Col>
          <Col xs={3}>Ymax</Col>
        </Row>
        {result.map((r, i) => (
          <Row className="w-100">
            <Col xs={3}>{i * 10}</Col>
            <Col xs={3}>{r[0]}</Col>
            <Col xs={3}>{r[1]}</Col>
            <Col xs={3}>{r[2]}</Col>
          </Row>
        ))}
      </div>
    </div>
  )
}

function AccuracyTable({ setting }) {
  const { trueValue } = setting

  const result = {
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

  return (
    <div className="w-100 h-100 d-flex px-3">
      <div className="border-table w-100 h-100 d-flex flex-column">
        <Row>
          <Col xs={3}>17:01:00-18:01:00</Col>
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
            <Row />
            <Row>路口直向</Row>
            <Row>4</Row>
          </Col>
          <Col xs={1}>
            <Row />
            <Row>N↓</Row>
            <Row />
          </Col>
          <Col xs={1}>{`1(西)
(南平路)`}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[0]).map((key) => (
            <Col xs={1}>
              {Object.keys(result[0][key]).map((way) => (
                <Row>{result[0][key][way]}</Row>
              ))}
            </Col>
          ))}
          {Object.keys(trueValue[0]).map((key) => (
            <Col xs={1} className="flex-grow-1">
              {Object.keys(trueValue[0][key]).map((way) =>
                trueValue[0][key][way] ? (
                  <Row className="w-100 flex-nowrap ms-0">
                    <Col xs={4} className="px-0">
                      {result[0][key][way] - trueValue[0][key][way]}
                    </Col>
                    <Col xs={8} className="px-0">
                      {`${(
                        ((result[0][key][way] - trueValue[0][key][way]) /
                          result[0][key][way]) *
                        100
                      ).toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row />
                )
              )}
            </Col>
          ))}
        </Row>
        <Row className="flex-fill">
          <Col xs={1}>
            <Row>路口橫向</Row>
            <Row>3</Row>
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row>1</Row>
            <Row />
          </Col>
          <Col xs={1}>{`2(北)
(中正路)`}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[1]).map((key) => (
            <Col xs={1}>
              {Object.keys(result[1][key]).map((way) => (
                <Row>{result[1][key][way]}</Row>
              ))}
            </Col>
          ))}
          {Object.keys(trueValue[1]).map((key) => (
            <Col xs={1} className="flex-grow-1">
              {Object.keys(trueValue[1][key]).map((way) =>
                trueValue[1][key][way] ? (
                  <Row className="w-100 flex-nowrap ms-0">
                    <Col xs={4} className="px-0">
                      {result[1][key][way] - trueValue[1][key][way]}
                    </Col>
                    <Col xs={8} className="px-0">
                      {`${(
                        ((result[1][key][way] - trueValue[1][key][way]) /
                          result[1][key][way]) *
                        100
                      ).toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row />
                )
              )}
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
            <Row>2</Row>
            <Row />
            <Row />
          </Col>
          <Col xs={1}>
            <Row />
            <Row />
            <Row />
          </Col>
          <Col xs={1}>{`3(東)
(南平路)`}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[2]).map((key) => (
            <Col xs={1}>
              {Object.keys(result[2][key]).map((way) => (
                <Row>{result[2][key][way]}</Row>
              ))}
            </Col>
          ))}
          {Object.keys(trueValue[2]).map((key) => (
            <Col xs={1} className="flex-grow-1">
              {Object.keys(trueValue[2][key]).map((way) =>
                trueValue[2][key][way] ? (
                  <Row className="w-100 flex-nowrap ms-0">
                    <Col xs={4} className="px-0">
                      {result[2][key][way] - trueValue[2][key][way]}
                    </Col>
                    <Col xs={8} className="px-0">
                      {`${(
                        ((result[2][key][way] - trueValue[2][key][way]) /
                          result[2][key][way]) *
                        100
                      ).toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row />
                )
              )}
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
          <Col xs={1}>{`4(南)
(中正路)`}</Col>
          <Col xs={1}>
            <Row>左轉</Row>
            <Row>直行</Row>
            <Row>右轉</Row>
          </Col>
          {Object.keys(result[3]).map((key) => (
            <Col xs={1}>
              {Object.keys(result[3][key]).map((way) => (
                <Row>{result[3][key][way]}</Row>
              ))}
            </Col>
          ))}
          {Object.keys(trueValue[0]).map((key) => (
            <Col xs={1} className="flex-grow-1">
              {Object.keys(trueValue[3][key]).map((way) =>
                trueValue[3][key][way] ? (
                  <Row className="w-100 flex-nowrap ms-0">
                    <Col xs={4} className="px-0">
                      {result[3][key][way] - trueValue[3][key][way]}
                    </Col>
                    <Col xs={8} className="px-0">
                      {`${(
                        ((result[3][key][way] - trueValue[3][key][way]) /
                          result[3][key][way]) *
                        100
                      ).toFixed(2)}%`}
                    </Col>
                  </Row>
                ) : (
                  <Row />
                )
              )}
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
    handleTimeEdit = () => {},
  } = useContext(DraftContext)
  const { videos = [] } = time.setting || {}
  const [selectedVideo, setselectedVideo] = useState(null)
  const videoData = useMemo(
    () => (selectedVideo !== null ? videos[selectedVideo] : {}),
    [selectedVideo, videos]
  )
  // const handleDataChange = (data) => {
  //   handleTimeEdit(timeId, {
  //     videos: videos.map((v, i) => (i === selected ? { ...v, ...data } : v)),
  //   })
  // }

  const [selected, setselected] = useState('')
  const [progress, setprogress] = useState(0)
  const startProgress = async () => {
    if (progress > 99) {
      setprogress(1)
      const interval = setInterval(() => {
        setprogress((oldvalue) => {
          const newValue = oldvalue + 1
          if (newValue > 99) {
            clearInterval(interval)
          }
          return newValue
        })
      }, 50)
    } else {
      const interval = setInterval(() => {
        setprogress((oldvalue) => {
          const newValue = oldvalue + 1
          if (newValue > 99) {
            handleTimeEdit(timeId, {
              videos: videos.map((v, i) =>
                i === parseInt(selectedVideo, 10)
                  ? {
                      ...v,
                      forensics: true,
                    }
                  : v
              ),
            })
            clearInterval(interval)
          }
          return newValue
        })
      }, 50)
    }
  }

  const gallerys = [
    gallery1,
    gallery2,
    gallery3,
    gallery4,
    gallery5,
    gallery6,
    gallery7,
  ]

  const headers = ['CarType', 'minD', 'maxD', 'ax', 'bx_add', 'bx_mult']
  const csvData = [
    {
      CarType: 'MotorBike',
      minD: '1.76',
      maxD: '16.7',
      ax: '0.4',
      bx_add: '-0.53475',
      bx_mult: '5.587497',
    },
    {
      CarType: 'SmallCar',
      minD: '1.13',
      maxD: '19.33',
      ax: '2.1',
      bx_add: '0.212431',
      bx_mult: '5.832322',
    },
    {
      CarType: 'BigCar',
      minD: '3.2',
      maxD: '15.08',
      ax: '2',
      bx_add: '1.900348',
      bx_mult: '18.22893',
    },
  ]

  // true value
  const [show, setshow] = useState(false)
  const [trueValue, settrueValue] = useState(defaultTrueValue)
  useEffect(
    () => settrueValue(videoData.trueValue?.traffic15 || defaultTrueValue),
    [videoData, selected]
  )

  const optionComponent = {
    每15分鐘各方向交通量: (
      <AccuracyTable
        setting={{
          trueValue,
        }}
      />
    ),
    每小時各方向交通量: (
      <AccuracyTable
        setting={{
          trueValue,
        }}
      />
    ),
    '軌跡分群與轉向量（視覺化）': (
      <Row className="h-100 overflow-scroll justify-content-start">
        {gallerys.map((gallery, i) => (
          <Image
            key={i}
            className="w-50 py-3"
            height="auto"
            src={gallery}
            fluid
          />
        ))}
      </Row>
    ),
    期望加減速率: <SpeedTable />,
    '車間距（計算量）': (
      <Table bordered responsive>
        <tbody>
          <tr>
            {headers.map((header) => (
              <td key={header}>{header}</td>
            ))}
          </tr>
          {csvData.map((d, i) => (
            <tr key={i}>
              {headers.map((header) => (
                <td key={header}>{d[header]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    ),
    '車間距（視覺化）': (
      <video width="auto" height="100%" controls>
        <track kind="captions" />
        <source src={camera7projection} />
      </video>
    ),
    '車輛辨識與追蹤（視覺化）': (
      <video width="auto" height="100%" controls>
        <track kind="captions" />
        <source src={camera14} />
      </video>
    ),
  }

  useEffect(() => {
    setselected('')
    setprogress(0)
  }, [selectedVideo])

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
                {videos.map(({ name }, i) => (
                  <option key={name} value={i}>
                    {name}
                  </option>
                ))}
              </Form.Select>
              <Button
                variant="revo"
                className="my-auto ms-2 w-30 text-nowrap"
                onClick={startProgress}
                disabled={!selectedVideo}
              >
                {progress && progress !== 100 ? (
                  <Spinner size="sm" />
                ) : (
                  '執行辨識'
                )}
              </Button>
            </div>
            {videoData.name && (
              <video className="mt-3" width="100%" height="auto" controls>
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
                disabled={!selectedVideo || !videoData?.forensics}
              >
                <option value="" className="d-none">
                  下拉檢視辨識結果
                </option>
                {[
                  {
                    label: '每15分鐘各方向交通量',
                  },
                  {
                    label: '每小時各方向交通量',
                  },
                  {
                    label:
                      videoData.type === '路口'
                        ? '軌跡分群與轉向量（視覺化）'
                        : '軌跡分群與轉向量（視覺化）（路段影像不適用）',
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
            <div className="h-70 w-100 overflow-hidden">
              {optionComponent[selected] || <div />}
            </div>
          </div>
        </Col>
        <Col xs={2} className="ps-0">
          <FormLabel className="text-revo w-100 fw-bold text-start">
            （3） 匯出與確認
          </FormLabel>
          <div className="w-100 h-100 d-flex flex-column pe-2 pt-3">
            <div className="d-flex w-100">
              <Button
                variant="revo2"
                className="text-nowrap"
                onClick={() => {}}
              >
                匯出Excel
              </Button>
              <Button
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
                <Row>4</Row>
              </Col>
              <Col xs={1}>
                <Row />
                <Row>N↓</Row>
                <Row />
              </Col>
              <Col xs={1}>{`1(西)
(南平路)`}</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {Object.keys(trueValue[0]).map((key) => (
                <Col>
                  {Object.keys(trueValue[0][key]).map((way) => (
                    <Row>
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
                <Row>3</Row>
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row>1</Row>
                <Row />
              </Col>
              <Col xs={1}>{`2(北)
(中正路)`}</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {Object.keys(trueValue[1]).map((key) => (
                <Col>
                  {Object.keys(trueValue[1][key]).map((way) => (
                    <Row>
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
                <Row>2</Row>
                <Row />
                <Row />
              </Col>
              <Col xs={1}>
                <Row />
                <Row />
                <Row />
              </Col>
              <Col xs={1}>{`3(東)
(南平路)`}</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {Object.keys(trueValue[2]).map((key) => (
                <Col>
                  {Object.keys(trueValue[2][key]).map((way) => (
                    <Row>
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
              <Col xs={1}>{`4(南)
(中正路)`}</Col>
              <Col xs={1}>
                <Row>左轉</Row>
                <Row>直行</Row>
                <Row>右轉</Row>
              </Col>
              {Object.keys(trueValue[3]).map((key) => (
                <Col>
                  {Object.keys(trueValue[3][key]).map((way) => (
                    <Row>
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

export default Step3
