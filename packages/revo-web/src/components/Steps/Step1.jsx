/* eslint-disable no-nested-ternary */
/* eslint-disable import/no-extraneous-dependencies */
import React, { useState, useEffect, useContext, useMemo } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faCirclePlus,
  faPenToSquare,
  faRightToBracket,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { DateRange } from 'react-date-range'
import {
  Container,
  Row,
  Col,
  Button,
  ListGroup,
  ListGroupItem,
  Image,
  Form,
  Modal,
  InputGroup,
} from 'react-bootstrap'
import { DraftContext } from '../ContextProvider'
import { architecture } from '../../assets'
// import { nenerabi } from '../../assets'

function DeleteModal({ setting }) {
  const { show, name, handleClose } = setting
  const { draftId, rangeId } = useContext(DraftContext)
  const step = useMemo(
    () => (draftId ? (rangeId ? '交維階段' : '計畫範圍') : '執行計畫'),
    [draftId, rangeId]
  )

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
          仍要刪除
          <span className="text-danger">{`「${name}」${step}`}</span>
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

function ProjectModal({ setting }) {
  const { show, form, defaultValue = {}, handleClose } = setting
  const [showDate, setshowDate] = useState(false)
  const { draftId, rangeId } = useContext(DraftContext)
  const step = useMemo(
    () => (draftId ? (rangeId ? '交維階段' : '計畫範圍') : '執行計畫'),
    [draftId, rangeId]
  )

  const [data, setdata] = useState({})
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  useEffect(() => {
    if (show) {
      setshowDate(false)
      setdata(
        form.reduce(
          (prev, cur) => ({
            ...prev,
            [cur.name]: defaultValue.setting
              ? defaultValue.setting[cur.name]
              : '',
          }),
          {}
        )
      )
    }
  }, [show, defaultValue])
  const [date, setdate] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: 'selection',
  })
  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="py-2 px-4"
    >
      <Modal.Header closeButton>
        {defaultValue.setting ? `編輯${step}` : `新建${step}`}
      </Modal.Header>
      <Modal.Body className="p-4">
        {form.map((f, i) => (
          <React.Fragment key={i}>
            <Form.Label className="mb-1 mt-3 fw-bold text-revo">
              {f.label}
            </Form.Label>
            {f.type === 'date' ? (
              <InputGroup>
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
                    position: 'absolute',
                    left: '-50',
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
                <Button variant="revo2" onClick={() => setshowDate(!showDate)}>
                  確認
                </Button>
              </InputGroup>
            ) : (
              <Form.Control
                name={f.name}
                type={f.type}
                value={data[f.name] || ''}
                onChange={onDataChange}
                placeholder={f.placeholder}
                onFocus={() => setshowDate(false)}
              />
            )}
          </React.Fragment>
        ))}
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button
          className="ms-auto"
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
          onClick={() => handleClose(data)}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function Projects() {
  const {
    draft,
    drafts,
    ranges,
    times,
    draftId,
    rangeId,
    // timeId,
    setDraftId,
    setRangeId,
    setTimeId,
    handleDraftAdd,
    handleDraftDelete,
    handleDraftEdit,
    handleRangeAdd,
    handleRangeDelete,
    handleRangeEdit,
    handleTimeAdd,
    handleTimeDelete,
    handleTimeEdit,
  } = useContext(DraftContext)

  const projectForm = [
    {
      name: 'id',
      label: '計畫編號',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'name',
      label: '計畫名稱',
      placeholder: '',
      type: 'text',
    },
  ]

  const rangeForm = [
    {
      name: 'id',
      label: '名稱',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'name',
      label: '範圍區域',
      placeholder: '',
      type: 'text',
    },
  ]

  const timeForm = [
    {
      name: 'date',
      label: '階段日期',
      placeholder: '',
      type: 'date',
    },
    {
      name: 'name',
      label: '階段名稱',
      placeholder: '',
      type: 'text',
    },
  ]

  const title = useMemo(
    () =>
      draftId
        ? rangeId
          ? '請選擇交維階段'
          : '請選擇計畫範圍'
        : '請選擇執行計畫',
    [draftId, rangeId]
  )

  const btntext = useMemo(
    () => (draftId ? (rangeId ? '新增交維階段' : '新增範圍') : '新增計畫'),
    [draftId, rangeId]
  )

  const setId = useMemo(
    () =>
      draftId
        ? rangeId
          ? (time_id) => setTimeId(time_id)
          : (range_id) => setRangeId(range_id)
        : (draft_id) => setDraftId(draft_id),
    [draftId, rangeId]
  )

  const form = useMemo(
    () => (draftId ? (rangeId ? timeForm : rangeForm) : projectForm),
    [draftId, rangeId]
  )

  const list = useMemo(
    () => (draftId ? (rangeId ? times : ranges) : drafts),
    [draftId, rangeId, drafts, ranges, times]
  )

  const handleAdd = useMemo(
    () =>
      draftId ? (rangeId ? handleTimeAdd : handleRangeAdd) : handleDraftAdd,
    [draftId, rangeId]
  )

  const handleEdit = useMemo(
    () =>
      draftId ? (rangeId ? handleTimeEdit : handleRangeEdit) : handleDraftEdit,
    [draftId, rangeId]
  )

  const handleDelete = useMemo(
    () =>
      draftId
        ? rangeId
          ? handleTimeDelete
          : handleRangeDelete
        : handleDraftDelete,
    [draftId, rangeId]
  )

  const [selectedId, setselectedId] = useState('')

  const [show, setshow] = useState(false)
  const handleClose = (value) => {
    setshow(false)
    if (selectedId) {
      if (!value) {
        setselectedId('')
        return
      }
      handleEdit(selectedId, value)
      setselectedId('')
    } else {
      if (!value) return
      handleAdd(value)
    }
    // if (!value) return
    // if (selectedId) {
    //   handleEdit(selectedId, value)
    //   setselectedId('')
    // } else handleAdd(value)
  }

  const [deleteShow, setdeleteShow] = useState(false)
  const handleDeleteClose = (value) => {
    setdeleteShow(false)
    if (value) handleDelete(selectedId)
    setselectedId('')
  }

  return (
    <>
      <Row className="px-5">
        <Col xs={10} className="d-flex">
          <h5 className="my-auto text-revo-light fw-bold">{title}</h5>
        </Col>
        <Col xs={2} className="d-flex ms-auto pe-0">
          <Button
            className="ms-auto"
            variant="outline-revo2"
            onClick={() => setshow(true)}
          >
            {btntext}&ensp;
            <FontAwesomeIcon icon={faCirclePlus} />
          </Button>
        </Col>
      </Row>
      <Row className="flex-grow-1 pt-3 pb-5 px-5" style={{ overflowY: 'auto' }}>
        {list && list.length ? (
          <ListGroup className="pe-0">
            {list.map(
              (
                { time_id, range_id, draft_id, setting, created_on, user_name },
                i
              ) => (
                <ListGroupItem className="d-flex" key={i}>
                  <p
                    className="w-40 my-auto text-start oneLineEllipsis"
                    title={setting.name}
                  >
                    <span className="fw-regular text-revo">計畫名稱：</span>
                    {setting.date || setting.id}-{setting.name}
                  </p>
                  <p className="w-15 my-auto text-start ps-2">
                    <span className="fw-regular text-revo">建立者</span>：
                    {user_name || draft.user_name}
                  </p>
                  <p className="w-15 my-auto text-start ps-2">
                    <span className="fw-regular text-revo">建立時間：</span>
                    {moment(created_on).format('yyyy-MM-DD')}
                  </p>
                  <Button
                    className="ms-auto me-2"
                    style={{ boxShadow: 'none' }}
                    variant="outline-revo me-2"
                    onClick={() => {
                      setselectedId(time_id || range_id || draft_id)
                      setshow(true)
                    }}
                    title="編 輯 編 號 ＆ 名 稱"
                    size
                  >
                    編輯&ensp;
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </Button>
                  <Button
                    style={{ boxShadow: 'none' }}
                    variant="outline-red"
                    onClick={() => {
                      setselectedId(time_id || range_id || draft_id)
                      setdeleteShow(true)
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

                  <Button
                    className="me-0"
                    style={{ boxShadow: 'none' }}
                    variant="revo"
                    onClick={() => setId(time_id || range_id || draft_id)}
                    title="選 擇 此 計 劃"
                  >
                    選擇&ensp;
                    <FontAwesomeIcon icon={faRightToBracket} />
                  </Button>
                </ListGroupItem>
              )
            )}
          </ListGroup>
        ) : (
          <div className="d-flex ps-3 border">
            <h5 className="m-auto text-revo-light">目前尚無資料</h5>
          </div>
        )}
      </Row>
      <ProjectModal
        setting={{
          show,
          form,
          defaultValue: selectedId
            ? list.find(
                (l) => (l.time_id || l.range_id || l.draft_id) === selectedId
              )
            : {},
          handleClose,
        }}
      />
      <DeleteModal
        setting={{
          show: deleteShow,
          name: list.find(
            (l) => (l.time_id || l.range_id || l.draft_id) === selectedId
          )?.setting.name,
          handleClose: handleDeleteClose,
        }}
      />
    </>
  )
}

function FlowChart() {
  return (
    <Row
      className="h-100 d-flex px-5 py-3"
      style={{ overflowX: 'auto', overflowY: 'auto' }}
    >
      {/* <p
        className="text-center align-self-center fw-bolder pb-5"
        style={{ color: '#9fdd80', fontSize: '4rem' }}
      >
        Hello user !
      </p> */}
      <Image className="m-auto w-100" src={architecture} fluid />
    </Row>
  )
}

function Step1({ setting }) {
  const { toolState } = setting

  const components = {
    操作流程圖: <FlowChart />,
    計畫一覽表: <Projects />,
  }

  return (
    <Container className="h-100 d-flex flex-column" fluid>
      {components[toolState.step1]}
    </Container>
  )
}

Step1.propTypes = {
  setting: PropTypes.shape().isRequired,
}

DeleteModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

ProjectModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step1
