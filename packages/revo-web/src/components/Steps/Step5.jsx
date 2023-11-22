/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-promise-executor-return */
import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Row,
  Col,
  FormLabel,
  Form,
  Button,
  Image,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { delay, qlen, v04, v04Rl, report } from '../../assets'
import apiServices from '../../services/apiServices'
import { DraftContext } from '../ContextProvider'

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
          <Col className="border d-flex">
            <p className="m-auto">{option.label}</p>
          </Col>
        </Row>
      ))}
    </Container>
  )
}

function Step5({ setting }) {
  const { handleDataChange } = setting
  console.log(handleDataChange)
  const initExport = {
    loading: false,
    show: false,
  }
  const [exports, setexports] = useState(initExport)
  const delayFunc = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // this is list of results and files
  const { timeId } = useContext(DraftContext)
  const [list, setlist] = useState({})
  const getList = async () => {
    const res = await apiServices.data({
      path: `model/list/${timeId}`,
      method: 'get',
    })
    const temp = {}
    const files = res.split('\r\n')
    files.slice(1, files.length).forEach((f) => {
      if (temp[f.split(',')[0]]) {
        temp[f.split(',')[0]].push({
          path: f.split(',')[1],
          note: f.split(',')[2],
        })
      } else {
        temp[f.split(',')[0]] = [
          {
            path: f.split(',')[1],
            note: f.split(',')[2],
          },
        ]
      }
    })
    setlist(temp)
  }
  useEffect(() => {
    getList()
  }, [])
  console.log(list)

  useEffect(() => {
    const generate = async () => {
      await delayFunc(1000)
      setexports({ loading: false, show: true })
    }
    if (exports.loading) generate()
  }, [exports.loading])

  const reports = [
    {
      label: '路口延滯時間',
      hover: <Image className="w-100 py-3" height="auto" src={delay} fluid />,
    },
    {
      label: '停等車隊長度',
      hover: <Image className="w-100 py-3" height="auto" src={qlen} fluid />,
    },
    {
      label: '路段旅行速率',
    },
    {
      label: '成效比較報總表',
      hover: <Image className="w-100 py-3" height="auto" src={report} fluid />,
    },
    {
      label: '方法比較影片',
      hover: (
        <>
          <div className="w-50 p-3 d-flex flex-column">
            <FormLabel>固定</FormLabel>
            <video width="auto" height="300px" controls>
              <track kind="captions" />
              <source src={v04} />
            </video>
          </div>
          <div className="w-50 p-3 d-flex flex-column">
            <FormLabel>RL</FormLabel>
            <video width="auto" height="300px" controls>
              <track kind="captions" />
              <source src={v04Rl} />
            </video>
          </div>
        </>
      ),
    },
  ]

  const [selected, setselected] = useState('')

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
              <div className="d-flex w-100">
                {reports[selected]?.hover || (
                  <Image
                    className="w-100 py-3"
                    height="auto"
                    src={report}
                    fluid
                  />
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

Step5.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step5
