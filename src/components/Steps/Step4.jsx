/* eslint-disable no-promise-executor-return */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  FormLabel,
  Modal,
  Spinner,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleXmark,
  faEnvelope,
} from '@fortawesome/free-solid-svg-icons'

function CheckTable({ setting }) {
  const { options } = setting
  return (
    <Container className="h-75 d-flex flex-column px-5 py-3 pt-0">
      {[...options, { label: '' }].map((option) => (
        <Row key={option.label} className="flex-grow-1">
          <Col xs={2} className="border d-flex">
            {option.label && (
              <FontAwesomeIcon
                className="m-auto"
                style={{
                  cursor: 'pointer',
                  color: option.label ? 'black' : 'transparent',
                }}
                icon={faCheckCircle}
                onClick={() => {}}
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

function Files({ setting }) {
  const { handleDataChange, handleToolChange } = setting
  const [files, setfiles] = useState([
    { label: 'file1', file: '', date: '' },
    { label: 'file2', file: '', date: '' },
    { label: 'file3', file: '', date: '' },
    { label: 'file4', file: '', date: '' },
    { label: 'file5', file: '', date: '' },
    { label: 'file6', file: '', date: '' },
    { label: 'file7', file: '', date: '' },
  ])

  const handleUpload = (e) =>
    setfiles(
      files.map((f) =>
        f.label === e.target.name ? { ...f, file: e.target.value } : f
      )
    )
  const handleDateChange = (e) => {
    setfiles(
      files.map((f) =>
        f.label === e.target.name ? { ...f, date: e.target.value } : f
      )
    )
  }

  const [uploading, setuploading] = useState(0)
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  const complete = async () => {
    await delay(2500)
    setuploading(2)
  }
  const back = async () => {
    await delay(2500)
    handleToolChange({
      target: {
        name: 'step4',
        value: 'selector',
      },
    })
  }
  useEffect(() => {
    if (uploading === 1) complete()
    if (uploading === 2) back()
  }, [uploading])
  return (
    <>
      {files.map((f) => (
        <Row
          key={f.label}
          className="pt-3 pb-5 px-5"
          style={{
            height: '10%',
          }}
        >
          <Col xs={1}>
            <Button variant="revo">
              <FormLabel className="mb-0" htmlFor={f.label}>
                選擇檔案
              </FormLabel>
            </Button>
            <Form.Control
              id={f.label}
              name={f.label}
              type="file"
              onChange={handleUpload}
              style={{
                visibility: 'hidden',
              }}
            />
          </Col>
          <Col xs={7}>
            <Form.Control type="text" value={f.file || ''} readOnly />
          </Col>
          <Col>
            <Form.Control
              placeholder="請輸入名稱..."
              name={f.label}
              type="text"
              value={f.date}
              onChange={handleDateChange}
            />
          </Col>
        </Row>
      ))}

      <Row
        className="pt-3 pb-5 px-4 pe-5 d-flex"
        style={{
          height: '10%',
        }}
      >
        {uploading === 0 && (
          <Button
            variant="revo2"
            className="my-auto ms-auto"
            style={{
              width: '5%',
            }}
            onClick={() => {
              handleDataChange({
                target: { name: 'modals', value: files },
              })
              setuploading(1)
            }}
          >
            上傳
          </Button>
        )}
        {uploading === 1 && (
          <div className="d-flex h5">
            <Spinner className="ms-auto my-auto" size="sm" animation="border" />
            <span className="my-auto ms-2">上傳中</span>
          </div>
        )}
        {uploading === 2 && (
          <div className="d-flex h5">
            <FontAwesomeIcon
              className="check-revo ms-auto my-auto me-2"
              icon={faCheckCircle}
            />
            <span className="my-auto">上傳完成</span>
          </div>
        )}
      </Row>
    </>
  )
}

function Step4({ setting }) {
  const { modals, toolState, handleToolChange, handleDataChange } = setting
  // const [selected, setselected] = useState('')
  const [checked, setchecked] = useState(false)
  const [show, setshow] = useState(false)

  const components = {
    selector: (
      <Row className="h-100 justify-content-center">
        {[
          {
            label: '模型上傳',
            name: 'step4',
            value: '模型上傳',
            check: modals.length > 0,
          },
          {
            label: '模型驅動',
            name: 'step4',
            value: '模型驅動',
          },
        ].map((s) => (
          <Col xs={3} className="d-flex" key={s.value}>
            <div
              className="my-auto py-5 px-3 w-100"
              style={{
                height: '500px',
              }}
            >
              <Card
                className="h-75 w-100 d-flex bg-revo-light"
                onClick={() =>
                  handleToolChange({
                    target: { name: 'step4', value: s.value },
                  })
                }
              >
                <span
                  className="fs-5 fw-bold text-revo my-auto"
                  style={{ cursor: 'pointer' }}
                  title={s.label}
                >
                  {s.label}
                </span>
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
    模型上傳: (
      <Files
        setting={{
          handleDataChange,
          handleToolChange,
        }}
      />
    ),
    模型驅動: (
      <>
        <Row className="h-100 overflow-hidden px-4">
          <Col xs={4} className="h-100 mh-100">
            <FormLabel className="text-revo fw-bold">選擇模型</FormLabel>
            <Form.Select
              className="w-100 mb-3 mx-3"
              aria-label="Default select example"
              // onChange={(e) => setselected(e.target.value)}
            >
              {[
                {
                  label: '固定時刻模型',
                },
                {
                  label: 'Vistro最佳化時制模型',
                },
              ].map((c, i) => (
                <option key={i} value={c.label}>
                  {c.label}
                </option>
              ))}
            </Form.Select>
          </Col>
          <Col xs={4} className="h-100 mh-100">
            <Row className="d-flex">
              <FormLabel className="text-revo fw-bold text-center">
                功能列表
              </FormLabel>
              <Button
                variant="revo"
                className="w-80 mx-auto"
                onClick={() => {
                  setchecked(!checked)
                }}
              >
                {checked ? '已啟動AI調校監控' : '未啟動AI調校監控'}&ensp;
                <FontAwesomeIcon
                  icon={checked ? faCheckCircle : faCircleXmark}
                />
              </Button>
            </Row>
            <Row className="d-flex px-0 mt-3">
              <Button
                variant="revo"
                className="w-80 mx-auto"
                onClick={() => {
                  setshow(true)
                }}
              >
                發送派工單&ensp;
                <FontAwesomeIcon icon={faEnvelope} />
              </Button>
            </Row>
          </Col>
          <Col xs={4} className="h-50">
            <FormLabel className="text-revo fw-bold">已執行列表</FormLabel>
            <CheckTable
              setting={{
                options: [
                  {
                    label: '',
                  },
                  {
                    label: '',
                  },
                  {
                    label: '',
                  },
                ],
              }}
            />
          </Col>
        </Row>
        <Modal
          style={{ zIndex: '1501' }}
          show={show}
          onHide={() => setshow(false)}
          className="p-2"
        >
          <Modal.Header closeButton />
          <Modal.Body className="d-flex flex-column text-center pb-5">
            <div className="d-flex h-50">
              <FontAwesomeIcon
                className="m-auto p-5 text-revo"
                style={{ fontSize: '4rem' }}
                icon={faCheckCircle}
              />
            </div>
            <h4 className="text-revo fw-bold">已寄送模型調校工單至email:</h4>
            <h4>smalloshin@gmail.com</h4>
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
    ),
  }

  return (
    <Container className="h-100 d-flex flex-column" fluid>
      {components[toolState.step4]}
    </Container>
  )
}

Step4.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Files.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step4
