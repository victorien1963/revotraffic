import React, { useState } from 'react'
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
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons'

function CheckTable({ setting }) {
  const { options } = setting
  return (
    <Container className="h-75 d-flex flex-column px-5 py-3">
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
  const { handleUploadAll } = setting
  const [files, setfiles] = useState([
    { label: 'file1', file: '', date: '' },
    { label: 'file2', file: '', date: '' },
    { label: 'file3', file: '', date: '' },
    { label: 'file4', file: '', date: '' },
    { label: 'file5', file: '', date: '' },
    { label: 'file6', file: '', date: '' },
    { label: 'file7', file: '', date: '' },
  ])
  console.log(files)
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
            <Button>
              <FormLabel htmlFor={f.label}>選擇檔案</FormLabel>
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
              name={f.label}
              type="text"
              value={f.date}
              onChange={handleDateChange}
            />
          </Col>
        </Row>
      ))}

      <Row
        className="pt-3 pb-5 px-4 d-flex"
        style={{
          height: '10%',
        }}
      >
        <Button
          className="my-auto ms-auto"
          style={{
            width: '5%',
          }}
          onClick={() => handleUploadAll(files)}
        >
          上傳
        </Button>
      </Row>
    </>
  )
}

function Step4({ setting }) {
  const { toolState, handleToolChange, handleDataChange } = setting
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
          },
          {
            label: '模型驅動',
            name: 'step4',
            value: '模型驅動',
          },
        ].map((s) => (
          <Col xs={3} className="d-flex" key={s.value}>
            <div
              className="my-auto p-5 w-100"
              style={{
                height: '500px',
              }}
            >
              <Card
                className="h-75 w-100 d-flex"
                onClick={() =>
                  handleToolChange({
                    target: { name: 'step4', value: s.value },
                  })
                }
              >
                <span className="m-auto">{s.label}</span>
              </Card>
              <FontAwesomeIcon className="h5 mt-2" icon={faCircle} />
            </div>
          </Col>
        ))}
      </Row>
    ),
    模型上傳: (
      <Files
        setting={{
          handleUploadAll: (files) => {
            handleDataChange({
              target: { name: 'files', value: files },
            })
            handleToolChange({
              target: { name: 'step4', value: 'selector' },
            })
          },
        }}
      />
    ),
    模型驅動: (
      <>
        <Row className="h-100 overflow-hidden px-3">
          <Col xs={3} className="h-100 mh-100">
            <FormLabel>選擇模型</FormLabel>
            <Form.Select
              className="w-100 mb-3"
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
          <Col xs={2} className="h-100 mh-100">
            <Row className="d-flex px-0">
              <Button
                className="w-75"
                onClick={() => {
                  setchecked(!checked)
                }}
              >
                是否啟動AI調校監控
              </Button>
              <FontAwesomeIcon
                className="my-auto w-25 px-0"
                style={{
                  cursor: 'pointer',
                }}
                icon={checked ? faCheckCircle : faTimes}
              />
            </Row>
          </Col>
          <Col xs={1} className="h-100 mh-100">
            <Row className="d-flex px-0">
              <Button
                className="w-100"
                onClick={() => {
                  setshow(true)
                }}
              >
                發送派工單
              </Button>
            </Row>
          </Col>
          <Col className="h-50">
            <FormLabel>已執行列表</FormLabel>
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
          <Modal.Body className="d-flex flex-column text-center">
            <div className="d-flex h-50">
              <FontAwesomeIcon className="m-auto p-5 h1" icon={faCheckCircle} />
            </div>
            <h4>已寄送模型調校工單至email:</h4>
            <h4>smalloshin@gmail.com</h4>
          </Modal.Body>
          <Modal.Footer>
            <Button
              style={{ boxShadow: 'none', color: '#317985' }}
              variant="link"
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
