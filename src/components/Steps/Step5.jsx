import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, FormLabel, Form, Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'

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
  console.log(setting)

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
                <h4 className="text-start">{option.label}</h4>
              </Col>
            </Row>
          ))}
        </Col>
        <Col xs={4} className="h-100 d-flex flex-column">
          <FormLabel>選擇存檔路徑</FormLabel>
          <Form.Control />
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
              onClick={() => {}}
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
