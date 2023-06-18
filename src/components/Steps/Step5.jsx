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
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { vissimRlSummary } from '../../assets'

function CheckTable({ setting }) {
  const { options } = setting
  return (
    <Container className="h-75 d-flex flex-column px-5 py-3">
      <Row className="flex-grow-1">
        <Col xs={2} className="border d-flex">
          <FontAwesomeIcon
            className="m-auto"
            style={{
              cursor: 'pointer',
            }}
            icon={faCheckCircle}
            onClick={() => {}}
          />
        </Col>
        <Col className="border d-flex">
          <p className="m-auto">全選</p>
        </Col>
      </Row>
      {[...options, { label: '' }].map((option) => (
        <Row key={option.label} className="flex-grow-1">
          <Col xs={2} className="border d-flex">
            <FontAwesomeIcon
              className="m-auto"
              style={{
                cursor: 'pointer',
                color: option.label ? 'black' : 'transparent',
              }}
              icon={faCheckCircle}
              onClick={() => {}}
            />
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
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const exportExcel = () => {
    setexports({ loading: true, show: false })
  }
  useEffect(() => {
    const generate = async () => {
      await delay(1000)
      setexports({ loading: false, show: true })
    }
    if (exports.loading) generate()
  }, [exports.loading])

  return (
    <Container>
      <Row className="h-100 overflow-hidden px-3">
        <Col xs={4} className="h-100">
          <FormLabel>選擇模型</FormLabel>
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
        </Col>
        <Col xs={4} className="h-100">
          <FormLabel>選擇欲匯出之報表</FormLabel>
          {[
            {
              label: '全選',
            },
            {
              label: '路口延滯時間',
            },
            {
              label: '停等車隊長度',
            },
            {
              label: '路段旅行速率',
            },
            {
              label: '成效比較報總表',
            },
            {
              label: '方法比較影片',
            },
          ].map((option) => (
            <Row className="py-5">
              <Col xs={2} className="d-flex">
                <FontAwesomeIcon
                  className="m-auto"
                  style={{
                    cursor: 'pointer',
                  }}
                  icon={faCheckCircle}
                  onClick={() => {}}
                />
              </Col>
              <Col className="d-flex">
                <OverlayTrigger
                  placement="right"
                  delay={{ show: 250, hide: 400 }}
                  overlay={
                    <Tooltip
                      className="quesTip"
                      style={{
                        zIndex: '9999',
                      }}
                    >
                      <Image
                        className="w-100 py-3"
                        height="auto"
                        src={vissimRlSummary}
                        fluid
                      />
                    </Tooltip>
                  }
                >
                  <h4 className="text-start">{option.label}</h4>
                </OverlayTrigger>
              </Col>
            </Row>
          ))}
        </Col>
        <Col xs={4} className="h-100 d-flex flex-column">
          <FormLabel className="text-start">選擇存檔路徑</FormLabel>
          <Row>
            <Form.Control
              className="w-75"
              value="C://users/User/downloads/export.xlsx"
            />
            <Button
              className="my-auto ms-3 me-auto"
              style={{
                width: '15%',
              }}
              onClick={exportExcel}
            >
              匯出Excel
            </Button>
          </Row>
          <Row className="py-5">
            {exports.loading && (
              <Spinner className="m-auto" animation="border" />
            )}
            {exports.show && (
              <>
                <Col className="d-flex">
                  <h4 className="text-start">已匯出至目的資料夾</h4>
                </Col>
                <Col xs={2} className="d-flex">
                  <FontAwesomeIcon
                    className="m-auto h4"
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
  )
}

Step5.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step5
