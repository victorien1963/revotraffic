/* eslint-disable no-nested-ternary */
import React, { useState } from 'react'
import moment from 'moment'
import PropTypes from 'prop-types'
import { DateRange } from 'react-date-range'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  FormLabel,
  Button,
  Image,
  Modal,
} from 'react-bootstrap'
import { faCheckCircle, faCircle } from '@fortawesome/free-solid-svg-icons'
import { camera7preview, camera14preview } from '../../assets'

function NumberTag({ setting }) {
  console.log(setting)
  return <div />
}

function RoadTag({ setting }) {
  console.log(setting)
  return <div />
}

function RoadModal({ setting }) {
  const { show, handleClose } = setting
  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="p-2"
    >
      <Modal.Body>
        <Col xs={7}>
          <Image className="mx-auto w-100 " src={camera14preview} fluid />
        </Col>
        <Col />
      </Modal.Body>
      <Modal.Footer>
        <Button
          style={{ boxShadow: 'none', color: '#317985' }}
          variant="link"
          onClick={() => handleClose()}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Road({ setting }) {
  // const { videos, roads, handleDataChange, handleToolChange } = setting
  const { roads, videos } = setting
  console.log(roads)
  const [selected, setselected] = useState('')
  const [showDate, setshowDate] = useState(false)
  const [date, setdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  })
  const form = [
    {
      name: 'name',
      label: '名稱',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'date',
      label: '日期',
      placeholder: '',
      type: 'date',
    },
    {
      name: 'type',
      label: '類型',
      placeholder: '',
      type: 'tab',
      content: [
        { label: '路口', value: '路口' },
        { label: '路段', value: '路段' },
      ],
    },
    {
      name: 'way',
      label: '方向',
      placeholder: '',
      type: 'check',
    },
    {
      name: 'entry',
      label: '出入口',
      placeholder: '',
      type: 'check',
    },
    {
      name: 'path',
      label: '車道數',
      placeholder: '',
      type: 'check',
    },
    {
      name: 'roadName',
      label: '各方向路名',
      placeholder: '',
      type: 'check',
    },
  ]

  const [data, setdata] = useState({})
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  console.log(selected)
  return selected !== '' ? (
    <Row className="flex-grow-1 pt-3 pb-5 px-4">
      <Col>
        {form.map((f, i) => {
          switch (f.type) {
            case 'check':
              return (
                <React.Fragment key={i}>
                  <Row className="py-3">
                    <Col xs={2}>
                      <Form.Label>{f.label}</Form.Label>
                    </Col>
                    <Col>
                      <FontAwesomeIcon
                        className="h5 mt-2"
                        icon={faCheckCircle}
                      />
                    </Col>
                  </Row>
                </React.Fragment>
              )
            case 'tab':
              return (
                <React.Fragment key={i}>
                  <Row className="py-3">
                    <Col xs={2}>
                      <Form.Label>{f.label}</Form.Label>
                    </Col>
                    {f.content.map((c) => (
                      <Col>{c.label}</Col>
                    ))}
                  </Row>
                </React.Fragment>
              )
            case 'date':
              return (
                <React.Fragment key={i}>
                  <Row className="py-3">
                    <Col xs={2}>
                      <Form.Label>{f.label}</Form.Label>
                    </Col>
                    <Col>
                      <Form.Control
                        name={f.name}
                        type="text"
                        value={data[f.name] || f.placeholder}
                        placeholder={f.placeholder}
                        onFocus={() => setshowDate(!showDate)}
                        readOnly
                      />
                      <div
                        style={{
                          height: showDate ? '100%' : '0%',
                          transition: 'height .3s ease-in',
                        }}
                      >
                        {showDate && (
                          <DateRange
                            ranges={[date]}
                            editableDateInputs
                            onChange={({ selection }) => {
                              setdate(selection)
                              onDataChange({
                                target: {
                                  name: 'date',
                                  value: `${moment(selection.startDate).format(
                                    'yyyy-MM-DD'
                                  )}-${moment(selection.endDate).format(
                                    'yyyy-MM-DD'
                                  )}`,
                                },
                              })
                            }}
                            moveRangeOnFirstSelection={false}
                          />
                        )}
                      </div>
                    </Col>
                  </Row>
                </React.Fragment>
              )
            default:
              return (
                <React.Fragment key={i}>
                  <Row className="py-3">
                    <Col xs={2}>
                      <Form.Label>{f.label}</Form.Label>
                    </Col>
                    <Col>
                      <Form.Control
                        name={f.name}
                        type={f.type}
                        onChange={onDataChange}
                        placeholder={f.placeholder}
                        onFocus={() => setshowDate(false)}
                      />
                    </Col>
                  </Row>
                </React.Fragment>
              )
          }
        })}
      </Col>
      <Col>
        <Image className="mx-auto w-100 " src={camera7preview} fluid />
      </Col>
    </Row>
  ) : (
    <>
      <Row className="pt-3 pb-5 px-4">
        <Col xs={2}>
          <FormLabel htmlFor="file">選擇影片</FormLabel>
        </Col>
      </Row>
      <Row className="flex-grow-1 pt-3 pb-5 px-4">
        {videos.map(({ name }, i) => (
          <Col
            xs={3}
            className="d-flex flex-column"
            key={name}
            onClick={() => setselected(i)}
          >
            <p
              style={{
                height: '10%',
              }}
            >{`${i + 1}.${name}`}</p>
            <Image
              className="mx-auto w-100 "
              src={i % 2 === 0 ? camera7preview : camera14preview}
              fluid
            />
          </Col>
        ))}
      </Row>
    </>
  )
}

function Video({ setting }) {
  const { videos, handleDataChange, handleToolChange } = setting
  const [file, setfile] = useState(null)
  const [uploading, setuploading] = useState(false)
  const handleUpload = (e) => {
    setuploading(true)
    setfile(URL.createObjectURL(e.target.files[0]))
    handleDataChange({
      target: {
        name: 'videos',
        value: [...videos, e.target.files[0]],
      },
    })
  }
  const handleRemoveVideo = (i) =>
    handleDataChange({
      target: {
        name: 'videos',
        value: videos.filter((video, index) => index !== i),
      },
    })
  return (
    <>
      <Row className="pt-3 pb-5 px-4">
        <Col xs={2}>
          <Button>
            <FormLabel htmlFor="file">選擇檔案</FormLabel>
          </Button>
          <Form.Control
            id="file"
            name="file"
            type="file"
            onChange={handleUpload}
            style={{
              visibility: 'hidden',
            }}
          />
        </Col>
        <Col>
          <Form.Control
            type="text"
            value={videos.length ? videos[videos.length - 1].name : ''}
            readOnly
          />
        </Col>
      </Row>
      <Row className="flex-grow-1 pt-3 pb-5 px-4 overflow-hidden">
        {uploading ? (
          <>
            <Col xs={4} />
            <Col xs={4}>
              <video width="auto" height="700px" controls>
                <track kind="captions" />
                <source src={file} />
              </video>
              {/* <Image className="mx-auto w-100" src={camera7preview} fluid /> */}
            </Col>
            <Col className="d-flex p-5" xs={4}>
              <Button
                className="mt-auto ms-auto"
                onClick={() => setuploading(false)}
              >
                確認
              </Button>
            </Col>
          </>
        ) : videos.length ? (
          <>
            {videos.map(({ name }, i) => (
              <Col xs={3} className="d-flex flex-column" key={name}>
                <p
                  style={{
                    height: '10%',
                  }}
                >{`${i + 1}.${name}`}</p>
                <div>
                  <Image
                    className="mx-auto"
                    src={i % 2 === 0 ? camera7preview : camera14preview}
                    fluid
                  />
                </div>
                <Button
                  className="mt-3 ms-auto"
                  onClick={() => handleRemoveVideo(i)}
                >
                  刪除
                </Button>
              </Col>
            ))}
            <Col xs={2} className="d-flex p-5">
              <Button
                className="mt-auto ms-auto"
                onClick={() =>
                  handleToolChange({
                    target: {
                      name: 'step2',
                      value: 'selector',
                    },
                  })
                }
              >
                確認
              </Button>
            </Col>
          </>
        ) : (
          <div className="d-flex ps-3 border">
            <h5 className="m-auto text-revo-light">目前尚無資料</h5>
          </div>
        )}
      </Row>
    </>
  )
}

function Step2({ setting }) {
  const { videos, roads, toolState, handleDataChange, handleToolChange } =
    setting
  const components = {
    selector: (
      <Row className="h-100">
        {[
          {
            label: '影片上傳',
            name: 'step2',
            value: '影片上傳',
          },
          {
            label: '路口、路段標記',
            name: 'step2',
            value: '路口、路段標記',
          },
          {
            label: '車種標記',
            name: 'step2',
            value: '車種標記',
          },
          {
            label: '軌跡標記',
            name: 'step2',
            value: '軌跡標記',
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
                    target: { name: 'step2', value: s.value },
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
    影片上傳: (
      <Video
        setting={{
          videos,
          handleDataChange,
          handleToolChange,
        }}
      />
    ),
    '路口、路段標記': (
      <Road
        setting={{
          videos,
          roads,
          handleDataChange,
        }}
      />
    ),
  }

  return (
    <Container className="h-100 d-flex flex-column" fluid>
      {components[toolState.step2]}
    </Container>
  )
}

Step2.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Video.propTypes = {
  setting: PropTypes.shape().isRequired,
}

Road.propTypes = {
  setting: PropTypes.shape().isRequired,
}

RoadModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

RoadTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

NumberTag.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step2
