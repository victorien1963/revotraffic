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
  Modal,
  ListGroup,
  ListGroupItem,
} from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCircleExclamation,
  faCirclePlus,
  faCloudArrowUp,
  faCubes,
  faFlaskVial,
  faPenToSquare,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import {
  faCircleCheck,
  faCircleXmark,
} from '@fortawesome/free-regular-svg-icons'
import { AuthContext, DraftContext, ToastContext } from '../ContextProvider'
import apiServices from '../../services/apiServices'

function WarnModal({ setting }) {
  const { show, text, handleClose } = setting
  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={handleClose}
      className="py-2 px-4"
    >
      <Modal.Header closeButton>
        <h4>通知</h4>
      </Modal.Header>
      <Modal.Body className="p-4 text-revo">
        <div className="d-flex pb-4">
          <FontAwesomeIcon
            icon={faCircleExclamation}
            className="text-revo text-center m-auto"
            style={{ height: '10vh' }}
          />
        </div>
        <h5 className="text-center">{text}</h5>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          className="m-auto"
          style={{ boxShadow: 'none' }}
          variant="revo"
          onClick={handleClose}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

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
                icon={faCircleCheck}
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

function Results({ setting }) {
  const { handleToolChange } = setting
  const [uploading, setuploading] = useState(0)
  const { auth } = useContext(AuthContext)
  const {
    timeId,
    rangeId,
    draftId,
    time = {},
    setTimes,
  } = useContext(DraftContext)
  const { results = [] } = time.setting || {}
  const [selected, setselected] = useState('')
  const [warning, setwarning] = useState({
    show: false,
    text: '',
    handleClose: () => {},
  })

  const [newFiles, setnewFiles] = useState([])
  const handleUpload = async () => {
    const formData = new FormData()
    newFiles.forEach((file) => formData.append('file', file))
    const uploadedModels = await apiServices.data({
      path: `model/results/${draftId}/${rangeId}/${timeId}`,
      method: 'post',
      data: formData,
      contentType: 'multipart/form-data',
    })

    const res = await apiServices.data({
      path: `time/${timeId}`,
      method: 'put',
      data: {
        results: [
          ...results,
          ...uploadedModels.map(({ name }) => ({
            name,
            originName: name,
            user: auth.name,
            type: selected,
            created_on: moment().format('yyyy-MM-DD hh:mm'),
          })),
        ],
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
    setnewFiles([])
    setuploading(0)
  }

  const handleEdit = async (newModels) => {
    const res = await apiServices.data({
      path: `time/${timeId}`,
      method: 'put',
      data: {
        results: newModels,
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
  }

  const [modelName, setmodelName] = useState('')
  const [modelNote, setmodelNote] = useState('')
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

  const limit = {
    路口延滯時間: 1,
    停等車隊長度: 1,
    路段旅行速率: 1,
    成效比較總表: 1,
    方法比較影片: 3,
  }

  const handleDownload = async () => {
    const urls = {
      路口延滯時間: ['model/file/1/1/1/a.xlsx'],
      停等車隊長度: ['model/file/1/1/1/b.xlsx'],
      路段旅行速率: ['model/file/1/1/1/c.xlsx'],
      成效比較總表: ['model/file/1/1/1/d.xlsx'],
      方法比較影片: ['model/file/1/1/1/04.mp4', 'model/file/1/1/1/04_rl.mp4'],
    }
    urls[selected].map(async (url) => {
      const res = await apiServices.data(
        selected === '方法比較影片'
          ? {
              path: url,
              method: 'get',
              responseType: 'arraybuffer',
            }
          : {
              path: url,
              method: 'get',
              responseType: 'blob',
            }
      )
      const blob = new Blob([res])
      const link = document.createElement('a')
      link.setAttribute('href', URL.createObjectURL(blob))
      link.setAttribute('download', url.split('/')[url.split('/').length - 1])
      document.body.appendChild(link)
      link.click()
      link.remove()
    })
  }
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
        {results && results.length ? (
          <ListGroup className="h-100 overflow-scroll scrollbarShow border">
            {results.map(({ name, user, type, note, created_on }, i) => (
              <ListGroupItem
                style={{
                  height: '29%',
                  minHeight: '29%',
                  maxHeight: '29%',
                }}
                className="d-flex border-end-0 rounded-0"
                key={i}
              >
                {editing === i ? (
                  <Form.Control
                    className="w-8 my-auto text-start"
                    value={
                      modelName.split('_')[modelName.split('_').length - 1]
                    }
                    onChange={(e) =>
                      setmodelName(
                        modelName
                          .split('_')
                          .slice(0, modelName.split('_').length - 1)
                          .concat(e.target.value)
                          .join('_')
                      )
                    }
                  />
                ) : (
                  <p className="w-8 my-auto text-start">
                    {name.split('_')[name.split('_').length - 1]}
                  </p>
                )}
                <p className="w-15 my-auto text-start">建立者：{user}</p>
                <p className="w-20 my-auto text-start">
                  建立時間：{created_on}
                </p>
                {type && (
                  <p className="w-15 my-auto text-start">檔案類型：{type}</p>
                )}

                <div className="w-15 my-auto d-flex">
                  <p className="text-nowrap my-auto">備註：</p>
                  {editing === i ? (
                    <Form.Control
                      className="my-auto text-start"
                      value={modelNote}
                      onChange={(e) => setmodelNote(e.target.value)}
                    />
                  ) : (
                    note
                  )}
                </div>
                {editing === i ? (
                  <>
                    <Button
                      className="ms-auto me-2 d-flex flex-nowrap"
                      style={{ boxShadow: 'none' }}
                      variant="outline-revo"
                      onClick={() => {
                        handleEdit(
                          results.map((m, j) =>
                            i !== j
                              ? m
                              : { ...m, name: modelName, note: modelNote }
                          )
                        )
                        setediting(-1)
                      }}
                      title="確定"
                      size
                    >
                      <p className="text-nowrap">確定&ensp;</p>
                      <FontAwesomeIcon
                        className="my-auto"
                        icon={faCircleCheck}
                      />
                    </Button>
                    <Button
                      className="me-2 d-flex flex-nowrap"
                      style={{ boxShadow: 'none' }}
                      variant="outline-secondary"
                      onClick={() => setediting(-1)}
                      title="取消"
                      size
                    >
                      <p className="text-nowrap">取消&ensp;</p>
                      <FontAwesomeIcon
                        className="my-auto"
                        icon={faCircleXmark}
                      />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="ms-auto me-2 d-flex flex-nowrap"
                    style={{ boxShadow: 'none' }}
                    variant="outline-revo me-2"
                    onClick={() => {
                      setmodelNote(note)
                      setmodelName(name)
                      setediting(i)
                    }}
                    title="編 輯 ＆ 名 稱"
                    size
                  >
                    <p className="text-nowrap">編輯&ensp;</p>
                    <FontAwesomeIcon className="my-auto" icon={faPenToSquare} />
                  </Button>
                )}
                <Button
                  className="d-flex flex-nowrap"
                  style={{ boxShadow: 'none' }}
                  variant="outline-red"
                  onClick={() => {
                    setdeleting({
                      show: true,
                      name: name.split('_')[name.split('_').length - 1],
                      handleClose: (value) => {
                        if (value) handleEdit(results.filter((m, j) => i !== j))
                        setdeleting({ ...deleting, show: false })
                      },
                    })
                    // setselectedId(time_id || range_id || draft_id)
                    // setdeleteShow(true)
                  }}
                  title="刪 除 計 劃"
                >
                  <p className="text-nowrap">刪除&ensp;</p>
                  <FontAwesomeIcon className="my-auto" icon={faTrashCan} />
                </Button>
              </ListGroupItem>
            ))}
          </ListGroup>
        ) : (
          <div className="d-flex ps-3 border">
            <h5 className="m-auto text-revo-light">目前尚無資料</h5>
          </div>
        )}
      </Row>
      <Row className="pt-1">
        <Col xs={7} className="d-flex px-5 pt-2">
          <h5 className="mt-auto text-revo-light fw-bold mb-0">待上傳</h5>
        </Col>
        <Col xs={5} className="d-flex pe-5 py-0">
          <Form.Select
            className="w-100 h-100"
            aria-label="Default select example"
            onChange={(e) => setselected(e.target.value)}
            value={selected}
          >
            <option value="" className="d-none">
              下拉選擇檔案類型
            </option>
            {[
              '路口延滯時間',
              '停等車隊長度',
              '路段旅行速率',
              '成效比較總表',
              '方法比較影片',
            ].map((label, i) => (
              <option key={i} value={label}>
                {label}
              </option>
            ))}
          </Form.Select>
          <Button
            variant="revo"
            size="sm h-100 w-20 mx-2 my-auto"
            onClick={handleDownload}
            disabled={!selected}
          >
            下載範本
          </Button>
        </Col>
      </Row>
      <Row className="py-0 px-5">
        <Button
          title="新增"
          className="text-revo fs-7 py-1 mx-0 my-1 mb-0"
          style={{
            background: 'rgba(35, 61, 99, 0.1)',
            border: '1px solid rgba(35, 61, 99, 0.1)',
            borderRadius: '0.375rem',
          }}
        >
          <Form.Label
            className="d-flex w-100 h-100 justify-content-center"
            style={{
              cursor: 'pointer',
            }}
            onClick={(e) => {
              if (!selected) {
                setwarning({
                  ...warning,
                  show: true,
                  text: '請先選擇檔案類型',
                  handleClose: () =>
                    setwarning({
                      ...warning,
                      show: false,
                    }),
                })
                e.stopPropagation()
              }
            }}
            htmlFor={selected ? 'upload' : ''}
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
            const length =
              Array.from(e.target.files).length +
              results.filter((r) => r.type === selected).length
            if (length > limit[selected]) {
              setwarning({
                ...warning,
                show: true,
                text: '同類型檔案超過數量上限，請先刪除或減少上傳檔案數量。',
                handleClose: () =>
                  setwarning({
                    ...warning,
                    show: false,
                  }),
              })
              return
            }
            setnewFiles(Array.from(e.target.files))
            e.stopPropagation()
          }}
          className="p-0 m-0 border-0 text-revo"
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
        <ListGroup className="h-100 overflow-scroll scrollbarShow border">
          {newFiles.map(({ name }, i) => (
            <ListGroupItem className="d-flex border-end-0 rounded-0" key={i}>
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
            </ListGroupItem>
          ))}
        </ListGroup>
      </Row>

      <Row
        className="px-4 py-2 d-flex"
        style={{
          height: '10%',
        }}
      >
        <Button
          variant="revo2"
          className="mx-auto mb-auto d-flex justify-content-center"
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
              icon={faCloudArrowUp}
              className="my-auto fs-5 text-dai-lighter fs-8"
            />
          )}
        </Button>
      </Row>
      <DeleteModal setting={deleting} />
      <WarnModal setting={warning} />
    </>
  )
}

function VISSIM({ setting }) {
  console.log(setting)
  // const { show, handleClose } = setting
  // const [access, setAccess] = useState('')
  const [file, setfile] = useState({})
  console.log(file)
  const { setToast } = useContext(ToastContext)
  const downloadFilePost = async (target, param) => {
    const res = await apiServices.data({
      path: `vissim`,
      method: 'post',
      params: {
        // access,
        target,
        ...param,
      },
      data: {
        file,
      },
      responseType: 'arraybuffer',
    })
    if (res.error) {
      setToast({ show: true, text: res.error })
      return
    }
    console.log(res)
    const blob = new Blob([res])
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', target)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <div
      style={{ zIndex: '1501' }}
      size="lg"
      // show={show}
      // onHide={() => handleClose()}
      className="p-2 d-flex flex-column"
    >
      <Modal.Header className="text-revo d-flex">
        <h5 className="text-center mx-auto py-3">VISSIM_RL 程式碼生成器</h5>
      </Modal.Header>
      <Modal.Body className="text-center my-auto">
        {/* <Row className="mb-3 d-flex">
          <p>請輸入驗證碼</p>
          <input
            className="w-50 mx-auto"
            type="text"
            value={access}
            onChange={(e) => setAccess(e.target.value)}
            defaultValue=""
          />
        </Row> */}
        <Row className="mb-3 justify-content-center">
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('setting.json', {})}
            >
              下載設定檔範本
            </Button>
          </Col>
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('setting_explain.txt', {})}
            >
              下載設定檔說明文件
            </Button>
          </Col>
        </Row>
        <Row className="mb-3">
          <p>上傳設定檔</p>
          <input
            className="mx-auto w-25"
            type="file"
            accept="application/JSON"
            onChange={(e) => {
              const reader = new FileReader()
              reader.onload = (d) => {
                console.log(d.target.result)
                const json = JSON.parse(d.target.result)
                console.log(json)
                setfile(json)
              }
              reader.readAsText(e.target.files[0])
            }}
          />
        </Row>
        <Row className="mb-3 justify-content-center">
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('train.py', {})}
              disabled={!file}
            >
              下載 train.py
            </Button>
          </Col>
          <Col xs={3}>
            <Button
              variant="revo2"
              onClick={() => downloadFilePost('test.py', {})}
              disabled={!file}
            >
              下載 test.py
            </Button>
          </Col>
        </Row>
        <div id="container" />
      </Modal.Body>
      {/* <Modal.Footer className="d-flex justify-content-end">
        <Button
          variant="revo2"
          className="mt-auto ms-2"
          onClick={() => handleClose()}
        >
          確認
        </Button>
      </Modal.Footer> */}
    </div>
  )
}

function Files({ setting }) {
  const { handleToolChange } = setting
  const [uploading, setuploading] = useState(0)
  const { auth } = useContext(AuthContext)
  const {
    timeId,
    rangeId,
    draftId,
    time = {},
    setTimes,
  } = useContext(DraftContext)
  const { models = [] } = time.setting || {}

  const [newFiles, setnewFiles] = useState([])
  const handleUpload = async () => {
    const formData = new FormData()
    newFiles.forEach((file) => formData.append('file', file))
    const uploadedModels = await apiServices.data({
      path: `model/file/${draftId}/${rangeId}/${timeId}`,
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
            originName: name,
            user: auth.name,
            created_on: moment().format('yyyy-MM-DD hh:mm'),
          })),
        ],
      },
    })
    setTimes((prevState) =>
      prevState.map((ps) => (ps.time_id === timeId ? res : ps))
    )
    setnewFiles([])
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
          <ListGroup className="h-100 overflow-scroll scrollbarShow border">
            {models.map(({ name, user, created_on }, i) => (
              <ListGroupItem
                style={{
                  height: '29%',
                  minHeight: '29%',
                  maxHeight: '29%',
                }}
                className="d-flex border-end-0 rounded-0"
                key={i}
              >
                {editing === i ? (
                  <Form.Control
                    className="w-30 my-auto text-start"
                    value={
                      modelName.split('_')[modelName.split('_').length - 1]
                    }
                    onChange={(e) =>
                      setmodelName(
                        modelName
                          .split('_')
                          .slice(0, modelName.split('_').length - 1)
                          .concat(e.target.value)
                          .join('_')
                      )
                    }
                  />
                ) : (
                  <p className="w-30 my-auto text-start">
                    {name.split('_')[name.split('_').length - 1]}
                  </p>
                )}
                <p className="w-25 my-auto text-start">建立者：{user}</p>
                <p className="w-25 my-auto text-start">
                  建立時間：{created_on}
                </p>
                {editing === i ? (
                  <>
                    <Button
                      className="ms-auto me-2 d-flex flex-nowrap"
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
                      <p className="text-nowrap">確定&ensp;</p>
                      <FontAwesomeIcon
                        className="my-auto"
                        icon={faCircleCheck}
                      />
                    </Button>
                    <Button
                      className="me-2 d-flex flex-nowrap"
                      style={{ boxShadow: 'none' }}
                      variant="outline-secondary"
                      onClick={() => setediting(-1)}
                      title="取消"
                      size
                    >
                      <p className="text-nowrap">取消&ensp;</p>
                      <FontAwesomeIcon
                        className="my-auto"
                        icon={faCircleXmark}
                      />
                    </Button>
                  </>
                ) : (
                  <Button
                    className="ms-auto me-2 d-flex flex-nowrap"
                    style={{ boxShadow: 'none' }}
                    variant="outline-revo me-2"
                    onClick={() => {
                      setmodelName(name)
                      setediting(i)
                    }}
                    title="編 輯 ＆ 名 稱"
                    size
                  >
                    <p className="text-nowrap">編輯&ensp;</p>
                    <FontAwesomeIcon className="my-auto" icon={faPenToSquare} />
                  </Button>
                )}
                <Button
                  className="d-flex flex-nowrap"
                  style={{ boxShadow: 'none' }}
                  variant="outline-red"
                  onClick={() => {
                    setdeleting({
                      show: true,
                      name: name.split('_')[name.split('_').length - 1],
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
                  <p className="text-nowrap">刪除&ensp;</p>
                  <FontAwesomeIcon className="my-auto" icon={faTrashCan} />
                </Button>
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
        <Col xs={6} className="d-flex px-5 pt-2">
          <h5 className="mt-auto text-revo-light fw-bold">待上傳</h5>
        </Col>
      </Row>
      <Row className="py-0 px-5">
        <Button
          title="新增"
          className="text-revo fs-7 py-1 mx-0 my-1 mb-0"
          style={{
            background: 'rgba(35, 61, 99, 0.1)',
            border: '1px solid rgba(35, 61, 99, 0.1)',
            borderRadius: '0.375rem',
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
        <ListGroup className="h-100 overflow-scroll scrollbarShow border">
          {newFiles.map(({ name }, i) => (
            <ListGroupItem className="d-flex border-end-0 rounded-0" key={i}>
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
            </ListGroupItem>
          ))}
        </ListGroup>
      </Row>

      <Row
        className="px-4 py-2 d-flex"
        style={{
          height: '10%',
        }}
      >
        <Button
          variant="revo2"
          className="mx-auto mb-auto d-flex justify-content-center"
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
              icon={faCloudArrowUp}
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

  const components = {
    selector: (
      <Row className="h-100 justify-content-center">
        {[
          {
            label: '模型訓練檔案生成',
            name: 'step4',
            value: '模型訓練檔案生成',
            check: modals.length > 0,
            icon: faCubes,
          },
          {
            label: '模型檔案管理',
            name: 'step4',
            value: '模型檔案管理',
            check: modals.length > 0,
            icon: faCubes,
          },
          {
            label: '實驗檔案管理',
            name: 'step4',
            value: '實驗檔案管理',
            icon: faFlaskVial,
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
                className="h-75 w-100 d-flex bg-revo-light fs-5 fw-bold text-revo"
                style={{ cursor: 'pointer' }}
                title={s.label}
                onClick={() =>
                  handleToolChange({
                    target: { name: 'step4', value: s.value },
                  })
                }
              >
                <FontAwesomeIcon
                  icon={s.icon}
                  className="fs-2 text-revo mx-auto mt-auto pb-3"
                />
                <div className="mx-auto mb-auto">{s.label}</div>
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
    模型訓練檔案生成: (
      <VISSIM
        setting={{
          handleDataChange,
          handleToolChange,
        }}
      />
    ),
    模型檔案管理: (
      <Files
        setting={{
          handleDataChange,
          handleToolChange,
        }}
      />
    ),
    實驗檔案管理: (
      <Results
        setting={{
          handleDataChange,
          handleToolChange,
        }}
      />
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

Results.propTypes = {
  setting: PropTypes.shape().isRequired,
}

DeleteModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

WarnModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

CheckTable.propTypes = {
  setting: PropTypes.shape().isRequired,
}

VISSIM.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step4
