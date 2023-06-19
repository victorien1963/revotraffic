/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Row,
  Col,
  Button,
  FormLabel,
  ProgressBar,
  Form,
  Image,
  Table,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
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
} from '../../assets'

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
      {[...options, { label: '...' }].map((option, i) => (
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
          <Col className="border d-flex">
            <p className="m-auto">{option.label}</p>
          </Col>
        </Row>
      ))}
    </Container>
  )
}

function Step3({ setting }) {
  const { toolState } = setting
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

  const optionComponent = {
    每15分鐘各方向交通量: <div />,
    每小時各方向交通量: <div />,
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
    期望加減速率: <div />,
    '車間距（計算量）': (
      <Table bordered responsive>
        <tbody>
          <tr>
            {headers.map((header) => (
              <td>{header}</td>
            ))}
          </tr>
          {csvData.map((d) => (
            <tr>
              {headers.map((header) => (
                <td>{d[header]}</td>
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
      <video width="80%" height="auto" controls>
        <track kind="captions" />
        <source src={camera14} />
      </video>
    ),
  }

  const components = {
    影像辨識: (
      <Row className="h-100 overflow-hidden">
        <Col xs={5} className="h-100 py-3">
          <div className="w-100 h-35">
            <FormLabel className="text-revo fw-bold">分析影片 - 路口</FormLabel>
            <CheckTable
              setting={{
                options: [
                  {
                    label: '111/03/22-中正南平路口',
                  },
                ],
              }}
            />
          </div>
          <div className="w-100 h-35">
            <FormLabel>分析影片 - 路段</FormLabel>
            <CheckTable
              setting={{
                options: [
                  {
                    label: '111/03/22-中正路',
                  },
                ],
              }}
            />
          </div>
          <div className="d-flex p-3 pt-3 mt-auto">
            <Button
              variant="revo"
              className="my-auto mx-3"
              onClick={startProgress}
            >
              執行辨識
            </Button>
            <ProgressBar
              className="w-75 rounded-pill fs-6 my-auto flex-fill"
              style={{ height: '30px' }}
            >
              <ProgressBar
                animated
                style={{
                  backgroundColor: progress < 100 ? '#FCBF49' : '#32a6af',
                  transition: '0.5s',
                }}
                now={progress}
                label={`${progress}%`}
              />
              <ProgressBar className="bg-revo-mid" now={100 - progress} />
            </ProgressBar>
          </div>
        </Col>
        <Col xs={5} className="h-100 pt-5 mh-100">
          <Form.Select
            className="w-100 mb-3 mt-3"
            aria-label="Default select example"
            onChange={(e) => setselected(e.target.value)}
          >
            {[
              {
                label: '每15分鐘各方向交通量',
              },
              {
                label: '每小時各方向交通量',
              },
              {
                label: '軌跡分群與轉向量（視覺化）',
              },
              {
                label: '期望加減速率',
              },
              {
                label: '車間距（視覺化）',
              },
              {
                label: '車間距（計算量）',
              },
              {
                label: '車輛辨識與追蹤（視覺化）',
              },
            ].map((c, i) => (
              <option key={i} value={c.label}>
                {c.label}
              </option>
            ))}
          </Form.Select>
          <div className="h-75 overrflow-hidden">
            {optionComponent[selected] || <div />}
          </div>
        </Col>
        <Col xs={2} className="pt-5 mt-3">
          <Button variant="revo2" className="me-auto" onClick={() => {}}>
            匯出Excel
          </Button>
          <Button
            variant="revo"
            className="position-absolute"
            style={{ bottom: '8%', right: '3%' }}
            onClick={() => {}}
          >
            下一步
          </Button>
        </Col>
      </Row>
    ),
  }

  return (
    <Container className="h-100 d-flex flex-column overflow-hidden" fluid>
      {components[toolState.step3]}
    </Container>
  )
}

Step3.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step3
