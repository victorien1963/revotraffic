/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-promise-executor-return */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Row,
  Col,
  FormLabel,
  Form,
  Button,
  Spinner,
  OverlayTrigger,
  Tooltip,
  Image,
  Modal,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { delay, qlen, v04, v04Rl, report } from '../../assets'

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
  const initExport = {
    loading: false,
    show: false,
  }
  const [exports, setexports] = useState(initExport)
  const delayFunc = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const exportExcel = () => {
    setexports({ loading: true, show: false })
  }
  useEffect(() => {
    const generate = async () => {
      await delayFunc(1000)
      setexports({ loading: false, show: true })
    }
    if (exports.loading) generate()
  }, [exports.loading])

  const [show, setshow] = useState(false)

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
      click: () => {
        setshow(true)
      },
    },
  ]
  const [checked, setchecked] = useState([])
  useEffect(() => {
    setchecked(reports.map(() => true))
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
    <>
      <Container>
        <Row className="h-100 overflow-hidden px-3">
          {/* <Col xs={4} className="h-50">
            <FormLabel className="text-revo fw-bold modal-table">
              選擇模型
            </FormLabel>
            <CheckTable
              setting={{
                options: [
                  {
                    label: '01-固定時制模型-啟動AI號校調控',
                  },
                  {
                    label: '02-Vistro最佳化時制模型',
                  },
                  {
                    label: '03-固定時制模型',
                  },
                ],
              }}
            />
          </Col> */}
          <Col xs={6} className="h-100">
            <FormLabel className="text-revo fw-bold">
              選擇欲匯出之報表
            </FormLabel>
            <Row className="py-4" onClick={handleCheckAll}>
              <Col xs={2} className="d-flex">
                <FontAwesomeIcon
                  className="m-auto"
                  style={{
                    cursor: 'pointer',
                    color: checked.every((c) => c) ? '#698b87' : 'grey',
                  }}
                  icon={faCheckCircle}
                />
              </Col>
              <Col className="d-flex">
                <h6
                  className="text-start"
                  style={{
                    cursor: 'pointer',
                  }}
                >
                  全選
                </h6>
              </Col>
            </Row>
            {reports.map((option, i) => (
              <Row key={i} className="py-4">
                <Col xs={2} className="d-flex">
                  <FontAwesomeIcon
                    className="m-auto"
                    style={{
                      cursor: 'pointer',
                      color: checked[i] ? '#698b87' : 'grey',
                    }}
                    icon={faCheckCircle}
                    onClick={() => handleCheck(i)}
                  />
                </Col>
                <Col className="d-flex">
                  <OverlayTrigger
                    placement="right"
                    delay={{ show: option.hover ? 250 : 100000, hide: 400 }}
                    overlay={
                      <Tooltip
                        className="quesTip"
                        style={{
                          zIndex: '9999',
                        }}
                      >
                        {option.hover || (
                          <Image
                            className="w-100 py-3"
                            height="auto"
                            src={report}
                            fluid
                          />
                        )}
                      </Tooltip>
                    }
                  >
                    <h6
                      className="text-start"
                      style={{
                        cursor: option.click ? 'pointer' : 'auto',
                      }}
                      onClick={() => {
                        if (option.click) option.click()
                      }}
                      aria-hidden
                    >
                      {option.label}
                    </h6>
                  </OverlayTrigger>
                </Col>
              </Row>
            ))}
          </Col>
          <Col xs={6} className="h-100 d-flex flex-column">
            <FormLabel className="text-revo fw-bold">選擇存檔路徑</FormLabel>
            <Row>
              <Form.Control
                className="w-60"
                value="C://users/User/downloads/export.xlsx"
                onChange={() => {}}
              />
              <Button
                className="my-auto ms-3 me-auto"
                style={{
                  width: '25%',
                }}
                onClick={exportExcel}
                variant="revo2"
              >
                匯出 Excel
              </Button>
            </Row>
            <Row className="py-4">
              {exports.loading && (
                <Spinner className="m-auto" animation="border" />
              )}
              {exports.show && (
                <>
                  <Col className="d-flex">
                    <h5 className="text-start fw-bold text-revo">
                      已匯出至目的資料夾
                    </h5>
                  </Col>
                  <Col xs={2} className="d-flex pe-5">
                    <FontAwesomeIcon
                      className="m-auto h5 text-revo"
                      style={{
                        cursor: 'pointer',
                      }}
                      icon={faCheckCircle}
                      onClick={() => {}}
                    />
                  </Col>
                </>
              )}
            </Row>
            <Row
              className="pt-3 pb-5 px-4 d-flex mt-auto"
              style={{
                height: '10%',
              }}
            >
              <Button
                variant="revo"
                className="my-auto ms-auto"
                style={{
                  width: '15%',
                }}
                onClick={() => handleDataChange({}, 'step1')}
              >
                完成
              </Button>
            </Row>
          </Col>
        </Row>
      </Container>
      <Modal
        style={{ zIndex: '1501' }}
        show={show}
        size="xl"
        onHide={() => setshow(false)}
        className="p-2"
      >
        <Modal.Header closeButton />
        <Modal.Body className="d-flex text-center pb-5">
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
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button
            style={{ boxShadow: 'none', color: '#317985' }}
            variant="revo2"
            onClick={() => setshow(false)}
          >
            確 認
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

Step5.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step5