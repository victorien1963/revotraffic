/* eslint-disable no-promise-executor-return */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useContext, useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  FormLabel,
  Modal,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCheckSquare,
  faCircleCheck,
  faCircleExclamation,
  faCirclePlus,
  faCircleXmark,
  faEnvelope,
  faPenToSquare,
  faTimesSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { AuthContext, DraftContext } from '../ContextProvider'
import apiServices from '../../services/apiServices'

function DeleteModal({ setting }) {
  const { show, name, handleClose } = setting

  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="py-2 px-4"
    >
      <Modal.Header closeButton />
      <Modal.Body className="p-4">
        <div className="d-flex">
          <FontAwesomeIcon
            className="px-0 m-auto text-revo text-center"
            style={{
              height: '100px',
            }}
            icon={faCircleExclamation}
          />
        </div>
        <h5 className="text-center lh-lg text-revo">
          <br />
          刪除後無法復原，
          <br />
          仍要刪除模組
          <span className="text-danger">{`「${name}」`}</span>
          嗎？
        </h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          className="ms-auto me-2"
          style={{ boxShadow: 'none' }}
          variant="secondary"
          onClick={() => handleClose()}
        >
          取 消
        </Button>
        <Button
          className="me-auto"
          style={{ boxShadow: 'none' }}
          variant="revo"
          onClick={() => handleClose(true)}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

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
  const { handleToolChange } = setting
  const [uploading, setuploading] = useState(0)
  const { auth } = useContext(AuthContext)
  const { timeId, time = {}, setTimes } = useContext(DraftContext)
  const { models = [] } = time.setting || {}

  const [newFiles, setnewFiles] = useState([])
  const handleUpload = async () => {
    const formData = new FormData()
    newFiles.forEach((file) => formData.append('file', file))
    const uploadedModels = await apiServices.data({
      path: `model/file/${timeId}`,
      method: 'post',
      data: formData,
      contentType: 'multipart/form-data',
    })

    const res = await apiServices.data({
      path: `time/${timeId}`,
      method: 'put',
      data: {
        models: [
          ...models,
          ...uploadedModels.map(({ name }) => ({
            name,
            user: auth.name,
            created_on: moment().format('yyyy-MM-DD hh:mm'),
          })),
        ],
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
    setuploading(0)
  }

  const handleEdit = async (newModels) => {
    const res = await apiServices.data({
      path: `time/${timeId}`,
      method: 'put',
      data: {
        models: newModels,
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
  }

  const [modelName, setmodelName] = useState('')
  const [editing, setediting] = useState(-1)
  const [deleting, setdeleting] = useState({
    show: false,
    name: '',
    handleClose: () => {},
  })

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
  // const complete = async () => {
  //   await delay(2500)
  //   setuploading(2)
  // }
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
    if (uploading === 1) handleUpload()
    if (uploading === 2) back()
  }, [uploading])
  return (
    <>
      <Row>
        <Col xs={12} className="d-flex px-5">
          <h5 className="my-auto text-revo-light fw-bold">已上傳列表</h5>
        </Col>
      </Row>
      <Row
        className="px-5 pb-0"
        style={{
          minHeight: '35%',
          maxHeight: '35%',
        }}
      >
        {models && models.length ? (
          <ListGroup className="h-100 overflow-scroll scrollbarShow">
            {models.map(({ name, user, created_on }, i) => (
              <ListGroupItem
                style={{
                  height: '33%',
                  minHeight: '33%',
                  maxHeight: '33%',
                }}
                className="d-flex"
                key={i}
              >
                {editing === i ? (
                  <Form.Control
                    className="w-30 my-auto text-start"
                    value={modelName}
                    onChange={(e) => setmodelName(e.target.value)}
                  />
                ) : (
                  <p className="w-30 my-auto text-start">{name}</p>
                )}
                <p className="w-25 my-auto text-start">建立者：{user}</p>
                <p className="w-25 my-auto text-start">
                  建立時間：{created_on}
                </p>
                {editing === i ? (
                  <>
                    <Button
                      className="ms-auto me-2"
                      style={{ boxShadow: 'none' }}
                      variant="outline-revo"
                      onClick={() => {
                        handleEdit(
                          models.map((m, j) =>
                            i !== j ? m : { ...m, name: modelName }
                          )
                        )
                        setediting(-1)
                      }}
                      title="確定"
                      size
                    >
                      確定&ensp;
                      <FontAwesomeIcon icon={faCheckSquare} />
                    </Button>
                    <Button
                      className="me-2"
                      style={{ boxShadow: 'none' }}
                      variant="outline-revo"
                      onClick={() => setediting(-1)}
                      title="取消"
                      size
                    >
                      取消&ensp;
                      <FontAwesomeIcon icon={faTimesSquare} />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="ms-auto me-2"
                    style={{ boxShadow: 'none' }}
                    variant="outline-revo me-2"
                    onClick={() => {
                      setmodelName(name)
                      setediting(i)
                    }}
                    title="編 輯 ＆ 名 稱"
                    size
                  >
                    編輯&ensp;
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Button>
                )}
                <Button
                  style={{ boxShadow: 'none' }}
                  variant="outline-red"
                  onClick={() => {
                    setdeleting({
                      show: true,
                      name,
                      handleClose: (value) => {
                        if (value) handleEdit(models.filter((m, j) => i !== j))
                        setdeleting({ ...deleting, show: false })
                      },
                    })
                    // setselectedId(time_id || range_id || draft_id)
                    // setdeleteShow(true)
                  }}
                  title="刪 除 計 劃"
                >
                  刪除&ensp;
                  <FontAwesomeIcon icon={faTrashCan} />
                </Button>

                <h2
                  className="my-auto text-grey"
                  style={{ userSelect: 'none' }}
                >
                  ｜
                </h2>
              </ListGroupItem>
            ))}
          </ListGroup>
        ) : (
          <div className="d-flex ps-3 border">
            <h5 className="m-auto text-revo-light">目前尚無資料</h5>
          </div>
        )}
      </Row>
      <Row>
        <Col xs={12} className="d-flex px-5">
          <h5 className="my-auto text-revo-light fw-bold">待上傳</h5>
        </Col>
      </Row>
      <Row className="py-0 px-5">
        <Button
          title="新增"
          className="text-revo fs-7 p-2 mx-0 my-1"
          style={{
            background: 'rgba(35, 61, 99, 0.1)',
            border: '1px solid rgba(35, 61, 99, 0.1)',
            borderRadius: '0.375rem',
            width: '99%',
          }}
        >
          <Form.Label
            className="d-flex w-100 h-100 justify-content-center"
            style={{
              cursor: 'pointer',
            }}
            htmlFor="upload"
          >
            <p className="my-auto">上傳新檔（可複選）</p>
            <FontAwesomeIcon
              icon={faCirclePlus}
              className="ms-1 my-auto fs-5 text-dai-lighter fs-8"
            />
          </Form.Label>
        </Button>
        <Form.Control
          id="upload"
          name="file"
          type="file"
          multiple
          onChange={(e) => {
            setnewFiles(Array.from(e.target.files))
            e.stopPropagation()
          }}
          className="p-0 m-0 border-0"
          style={{
            visibility: 'hidden',
            width: '0px',
            height: '0px',
          }}
        />
      </Row>
      <Row
        className="px-5 pb-0"
        style={{
          minHeight: '35%',
          maxHeight: '35%',
        }}
      >
        <ListGroup className="h-100 overflow-scroll scrollbarShow">
          {newFiles.map(({ name }, i) => (
            <ListGroupItem className="d-flex" key={i}>
              <p className="w-30 my-auto text-start">{name}</p>
              <p className="w-25 my-auto text-start">建立者：{auth.name}</p>
              <p className="w-25 my-auto text-start">建立時間：</p>
              {/* <Button
                className="ms-auto me-2"
                style={{ boxShadow: 'none' }}
                variant="outline-revo me-2"
                onClick={() => {
                  // setselectedId(time_id || range_id || draft_id)
                  // setshow(true)
                }}
                title="編 輯 名 稱"
                size
              >
                編輯&ensp;
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button> */}
              <Button
                className="ms-auto me-2"
                style={{ boxShadow: 'none' }}
                variant="outline-red"
                onClick={() => {
                  setnewFiles(newFiles.filter((f, j) => i !== j))
                }}
                title="刪 除 計 劃"
              >
                刪除&ensp;
                <FontAwesomeIcon icon={faTrashCan} />
              </Button>

              <h2 className="my-auto text-grey" style={{ userSelect: 'none' }}>
                ｜
              </h2>
            </ListGroupItem>
          ))}
        </ListGroup>
      </Row>

      <Row
        className="pt-3 pb-5 px-4 pe-5 d-flex"
        style={{
          height: '10%',
        }}
      >
        <Button
          variant="revo2"
          className="m-auto d-flex justify-content-center"
          style={{
            width: '15%',
          }}
          onClick={() => {
            setuploading(1)
          }}
          disabled={uploading || !newFiles.length}
        >
          <p className="my-auto me-2">確定上傳</p>
          {uploading ? (
            <span className="my-auto spinner-border spinner-border-sm" />
          ) : (
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="my-auto fs-5 text-dai-lighter fs-8"
            />
          )}
        </Button>
      </Row>
      <DeleteModal setting={deleting} />
    </>
  )
}

function Step4({ setting }) {
  const { modals = [], toolState, handleToolChange, handleDataChange } = setting
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

DeleteModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step4
