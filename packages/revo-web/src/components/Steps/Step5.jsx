/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-promise-executor-return */
import React, { useContext, useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, FormLabel, Form, Button } from 'react-bootstrap'
import { Group } from '@visx/group'
import { BarGroup } from '@visx/shape'
import { AxisBottom, AxisLeft } from '@visx/axis'
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale'
import { DraftContext } from '../ContextProvider'
import apiServices from '../../services/apiServices'
// import { report } from '../../assets'

function SpeedTable({ setting }) {
  const { width = 1000, height = 1000, result = '', title = '' } = setting
  if (!result || result.error) return <div />

  const refinedData = result
    .split('\r\n')
    .slice(1)
    .filter((r) => r.split(',')[0])
    .reduce((prev, cur) => {
      const [time, way, fix, vistro, rl] = cur.split(',')
      const time1 = time.substring(0, 4).trim()
      const time2 = time.substring(4).trim()
      return {
        ...prev,
        [time1]: {
          ...(prev[time1] || {}),
          [time2]: [
            ...(prev[time1] ? prev[time1][time2] || [] : []),
            [way, fix, vistro, rl],
          ],
        },
      }
    }, {})

  return (
    <Row
      className="border-table ps-5 pb-5"
      style={{
        width: `${width - 80}px`,
        height: `${height - 80}px`,
      }}
    >
      <Col className="h-100 w-20 border">
        <Row className="h-40 border">{title}</Row>
        <Row className="h-20 border" />
        <Row className="h-20 border">固定</Row>
        <Row className="h-20 border">Vistro</Row>
        <Row className="h-20 border">RL</Row>
      </Col>
      {Object.keys(refinedData).map((time1) =>
        Object.keys(refinedData[time1]).map((time2) => (
          <Col className="h-100 w-20">
            <Row className="h-20 border">{time1}</Row>
            <Row className="h-20 border">{time2}</Row>
            <Row className="h-80">
              {refinedData[time1][time2].map(([way, fix, vistro, rl]) => (
                <Col className="h-100 w-50">
                  <Row className="h-25 border">{way}</Row>
                  <Row className="h-25 border">{fix}</Row>
                  <Row className="h-25 border">{vistro}</Row>
                  <Row className="h-25 border">{rl}</Row>
                </Col>
              ))}
            </Row>
          </Col>
        ))
      )}
    </Row>
  )
}

function BarGroups({ setting }) {
  const {
    width = 1000,
    height = 1000,
    // events = false,
    result = '',
    subTitle,
  } = setting

  const blue = '#04a1ff'
  const green = '#60d937'
  const background = '#ffffff'

  const margin = { top: 40, right: 40, bottom: 120, left: 40 }

  if (!result || result.error) return <div />

  // bounds
  const xMax = width - margin.left - margin.right
  const yMax = height - margin.top - margin.bottom

  // update scale output dimensions
  const refinedData = result
    .split('\r\n')
    .slice(1)
    .filter((r) => r.split(',')[0])
    .map((r) => ({
      turn: parseFloat(r.split(',')[0]),
      fix: r.split(',')[1],
      rf: r.split(',')[2],
    }))
  const keys = Object.keys(refinedData[0]).filter((d) => d !== 'turn')
  const getTurn = (d) => d.turn
  const turnScale = scaleBand({
    domain: refinedData.map(getTurn),
    padding: 0.2,
  })
  const xScale = scaleBand({
    domain: keys,
    padding: 0.1,
  })
  const colorScale = scaleOrdinal({
    domain: keys,
    range: [blue, green],
  })
  const yScale = scaleLinear({
    domain: [
      0,
      Math.max(
        ...refinedData.map((d) =>
          Math.max(...keys.map((key) => Number(d[key])))
        )
      ),
    ],
  })
  turnScale.rangeRound([0, xMax])
  xScale.rangeRound([0, turnScale.bandwidth()])
  yScale.range([yMax, 0])

  return width < 10 ? null : (
    <svg width={width} height={height}>
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill={background}
        rx={14}
      />
      <Group top={margin.top} left={margin.left}>
        <rect
          fill={blue}
          width="15px"
          height="15px"
          x={xMax - margin.right - 80}
          y={margin.top - 36}
        />
        <text stroke={blue} x={xMax - margin.right - 60} y={margin.top - 24}>
          固定
        </text>
        <rect
          fill={green}
          width="15px"
          height="15px"
          x={xMax - margin.right - 20}
          y={margin.top - 36}
        />
        <text stroke={green} x={xMax - margin.right} y={margin.top - 24}>
          RL
        </text>
        <BarGroup
          data={refinedData}
          keys={keys}
          height={yMax}
          x0={getTurn}
          x0Scale={turnScale}
          x1Scale={xScale}
          yScale={yScale}
          color={colorScale}
        >
          {(barGroups) =>
            barGroups.map((barGroup) => (
              <Group
                key={`bar-group-${barGroup.index}-${barGroup.x0}`}
                left={barGroup.x0}
              >
                {barGroup.bars.map((bar) => (
                  <rect
                    key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                    x={bar.x + 30}
                    y={bar.y}
                    width={bar.width}
                    height={bar.height}
                    fill={bar.color}
                    rx={4}
                    // onClick={() => {
                    //   if (!events) return
                    //   const { key, value } = bar
                    //   alert(JSON.stringify({ key, value }))
                    // }}
                  />
                ))}
              </Group>
            ))
          }
        </BarGroup>
      </Group>
      <AxisBottom
        label="模擬回合"
        top={yMax + margin.top}
        left={margin.left + 30}
        // tickFormat={formatDate}
        scale={turnScale}
        stroke={green}
        tickStroke={green}
        // hideAxisLine
        tickLabelProps={{
          fill: green,
          fontSize: 11,
          textAnchor: 'middle',
        }}
      />
      <AxisLeft
        label={subTitle}
        top={margin.top}
        left={margin.left + 30}
        // tickFormat={formatDate}
        scale={yScale}
        stroke={green}
        tickStroke={green}
        // hideAxisLine
        tickLabelProps={{
          fill: green,
          fontSize: 11,
          textAnchor: 'end',
        }}
      />
    </svg>
  )
}

function Step5() {
  const initExport = {
    loading: false,
    show: false,
  }
  const [exports, setexports] = useState(initExport)
  const delayFunc = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // this is list of results and files
  const { draftId, rangeId, timeId, time = {} } = useContext(DraftContext)
  const { results = [] } = time.setting || {}
  const labels = [
    '路口延滯時間',
    '停等車隊長度',
    '路段旅行速率',
    '成效比較總表',
    '方法比較影片',
  ]
  const [list, setlist] = useState({})
  useEffect(() => {
    setlist(
      labels.reduce(
        (prev, cur) => ({
          ...prev,
          [cur]: results
            .filter((result) => result.type === cur)
            .map((r) => ({
              path: r.originName.split('/')[r.originName.split('/').length - 1],
              name: r.name.split('/')[r.name.split('/').length - 1],
              note: r.note,
            })),
        }),
        {}
      )
    )
  }, [results])

  useEffect(() => {
    const generate = async () => {
      await delayFunc(1000)
      setexports({ loading: false, show: true })
    }
    if (exports.loading) generate()
  }, [exports.loading])

  // svg size
  const ref = useRef(null)
  const [svgSize, setsvgSize] = useState({
    width: 0,
    height: 500,
  })
  const getSize = () => {
    if (ref.current) {
      const style = getComputedStyle(ref.current)
      const height =
        ref.current.clientHeight -
        parseFloat(style.paddingTop) -
        parseFloat(style.paddingBottom)
      const width = ref.current.clientWidth
      return { width, height }
    }
    return false
  }
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const size = getSize()
      if (size.width !== svgSize.width || size.height !== svgSize.height)
        setsvgSize(size)
    })
    observer.observe(ref.current)
    return () => ref.current && observer.unobserve(ref.current)
  }, [])

  const [selected, setselected] = useState('')
  const [result, setresult] = useState('')
  useEffect(() => {
    const getData = async (name) => {
      if (!name.includes('csv')) return
      const res = await apiServices.data({
        path: `model/file/${draftId}/${rangeId}/${timeId}/${name}`,
        method: 'get',
      })
      setresult(res)
    }
    if (list[labels[selected]] && list[labels[selected]][0])
      getData(list[labels[selected]][0].path)
  }, [selected])

  const reports = [
    {
      label: '路口延滯時間',
      // hover: <Image className="w-100 py-3" height="auto" src={delay} fluid />,
      hover: (
        <BarGroups
          setting={{
            ...svgSize,
            subTitle: '路口延滯時間',
            result,
          }}
        />
      ),
    },
    {
      label: '停等車隊長度',
      hover: (
        <BarGroups
          setting={{
            ...svgSize,
            subTitle: '停等車隊長度',
            result,
          }}
        />
      ),
    },
    {
      label: '路段旅行速率',
      hover: (
        <SpeedTable
          setting={{
            ...svgSize,
            title: '停等時間',
            result,
          }}
        />
      ),
    },
    {
      label: '成效比較報總表',
      hover: (
        <SpeedTable
          setting={{
            ...svgSize,
            title: '旅行時間',
            result,
          }}
        />
      ),
    },
    {
      label: '方法比較影片',
      hover: (
        <Row className="flex-nowrap overflow-scroll">
          {list['方法比較影片'] &&
            list['方法比較影片'].map((l) => (
              <Col>
                {/* <FormLabel>固定</FormLabel> */}
                <video width="auto" height="300px" controls>
                  <track kind="captions" />
                  <source
                    src={
                      list['方法比較影片']
                        ? `/api/model/file/${draftId}/${rangeId}/${timeId}/${l.path}`
                        : ''
                    }
                  />
                </video>
              </Col>
            ))}
          {/* <div className="w-50 p-3 d-flex flex-column">
            <FormLabel>固定</FormLabel>
            <video width="auto" height="300px" controls>
              <track kind="captions" />
              <source
                src={
                  list['方法比較影片']
                    ? `/api/model/file/${draftId}/${rangeId}/${timeId}/${list['方法比較影片'][0].path}`
                    : ''
                }
              />
            </video>
          </div>
          <div className="w-50 p-3 d-flex flex-column">
            <FormLabel>RL</FormLabel>
            <video width="auto" height="300px" controls>
              <track kind="captions" />
              <source
                src={
                  list['方法比較影片']
                    ? `/api/model/file/${draftId}/${rangeId}/${timeId}/${list['方法比較影片'][1].path}`
                    : ''
                }
              />
            </video>
          </div> */}
        </Row>
      ),
    },
  ]

  return (
    <Container>
      <Row className="h-100 overflow-hidden px-3">
        <Row className="h-100">
          <Col xs={4} className="h-100 px-4">
            <div className="w-100 h-100 d-flex flex-column px-0 overflow-hidden">
              <FormLabel className="text-revo fw-bold text-start">
                （1） 選擇結果報表
              </FormLabel>
              <div className="d-flex w-100">
                <Form.Select
                  className="w-100 mb-3 mt-3"
                  aria-label="Default select example"
                  onChange={(e) => setselected(e.target.value)}
                  value={selected}
                >
                  <option value="" className="d-none">
                    下拉選擇報表
                  </option>
                  {reports.map(({ label }, i) => (
                    <option key={i} value={i}>
                      {label}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Col>
          <Col xs={6} className="ps-0">
            <div className="w-100 h-100 d-flex flex-column px-0 overflow-hidden">
              <FormLabel className="text-revo fw-bold text-start">
                （2） 檢視結果
              </FormLabel>
              {list[labels[selected]] && list[labels[selected]][0] ? (
                <Row className="px-4 py-0 my-0">
                  {list[labels[selected]].map((l) => (
                    <Col className="d-flex">
                      <FormLabel className="text-revo fw-bold text-start text-nowrap w-50">
                        檔案名稱：{l.name}
                      </FormLabel>
                      {l.note && (
                        <FormLabel className="text-revo fw-bold text-end pe-3 w-50">
                          註解：{l.note}
                        </FormLabel>
                      )}
                    </Col>
                  ))}
                </Row>
              ) : (
                <Row className="px-4 py-0 my-0">
                  <Col className="d-flex">
                    <FormLabel className="text-revo fw-bold text-start text-nowrap w-50">
                      {selected ? '尚未上傳本類型檔案' : '請選擇檔案類型'}
                    </FormLabel>
                  </Col>
                </Row>
              )}
              <div className="d-flex w-100 flex-fill" ref={ref}>
                {list[labels[selected]] && list[labels[selected]][0] ? (
                  reports[selected]?.hover || <div />
                ) : (
                  <div />
                )}
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
                  匯出
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Row>
    </Container>
  )
}

export default Step5

BarGroups.propTypes = {
  setting: PropTypes.shape().isRequired,
}

SpeedTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}
