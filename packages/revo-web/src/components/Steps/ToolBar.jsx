/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Modal, Button } from 'react-bootstrap'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import { DraftContext } from '../ContextProvider'

function WarnModal({ setting }) {
  const { show, handleClose } = setting

  return (
    <Modal
      style={{ zIndex: '1501' }}
      show={show}
      onHide={() => handleClose()}
      className="py-2 px-4"
    >
      <Modal.Header closeButton>系統提示</Modal.Header>
      <Modal.Body className="p-4 h-100">
        <Row
          style={{
            height: '100px',
          }}
        >
          <FontAwesomeIcon
            className="h-75 px-0 my-auto text-revo"
            icon={faCircleExclamation}
          />
        </Row>
        <Row>
          <h4 className="text-center py-3 text-revo">Oops! 請先完成前置步驟</h4>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-center">
        <Button
          className="mx-auto"
          style={{ boxShadow: 'none' }}
          variant="outline-revo2"
          onClick={handleClose}
        >
          確 認
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

function ToolBar({ setting }) {
  const { step, handleToolChange } = setting
  const { timeId } = useContext(DraftContext)

  const tools = [
    {
      label: '首頁',
      name: 'step1',
      dropdowns: [
        {
          label: '操作流程圖',
          name: 'step1',
          value: '操作流程圖',
        },
        {
          label: '計畫一覽表',
          name: 'step1',
          value: '計畫一覽表',
        },
      ],
    },
    {
      label: '影片上傳標記',
      name: 'step2',
      dropdowns: [
        {
          label: '影片上傳',
          name: 'step2',
          value: '影片上傳',
        },
        {
          label: '路口＆路段標記',
          name: 'step2',
          value: '路口＆路段標記',
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
      ],
    },
    {
      label: 'AI影像辨識',
      name: 'step3',
      click: {
        name: 'step3',
        value: '影像辨識',
      },
      // dropdowns: [
      //   {
      //     label: '影像辨識',
      //     name: 'step3',
      //     value: '影像辨識',
      //   },
      // {
      //   label: '交通量檢核',
      //   name: 'step3',
      //   value: '交通量檢核',
      // },
      // ],
    },
    {
      label: 'AI號控調校',
      name: 'step4',
      click: {
        name: 'step4',
        value: 'selector',
      },
    },
    {
      label: '結果報表',
      name: 'step5',
      click: {
        name: 'step5',
        value: '結果報表',
      },
    },
  ]

  const [show, setShow] = useState(false)

  return (
    <Container fluid>
      <Row>
        <ul className="breadcrumbs-two px-0">
          {tools.map((tool, i) => (
            <li
              key={i}
              className={`bread${i + 1} ${
                tool.dropdowns ? 'dropdown' : ''
              } position-relative`}
            >
              <a
                className={`${tool.dropdowns ? 'dropdown-toggle' : ''}`}
                href="#"
                role="button"
                data-bs-toggle={`${tool.dropdowns ? 'dropdown' : ''}`}
                aria-expanded="false"
                onClick={() => {
                  if (!timeId && tool.click && tool.name !== 'step1') {
                    setShow(true)
                  } else if (tool.click)
                    handleToolChange({
                      target: {
                        ...tool.click,
                      },
                    })
                }}
              >
                <span>
                  <strong>{`${tool.name === step ? '➤ ' : ''}${
                    tool.label
                  }`}</strong>
                </span>
              </a>
              {tool.dropdowns && (
                <ul className="dropdown-menu">
                  {tool.dropdowns.map((d) => (
                    <li key={d.value}>
                      <a
                        className="dropdown-item"
                        onClick={() => {
                          if (!timeId && d.name !== 'step1') {
                            setShow(true)
                          } else {
                            handleToolChange({
                              target: {
                                name: d.name,
                                value: d.value,
                              },
                            })
                          }
                        }}
                        aria-hidden
                      >
                        {d.label}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            // <Col>
            //   {tool.component || (
            //     <Card>
            //       <Card.Body>{tool.component || tool.label}</Card.Body>
            //     </Card>
            //   )}
            // </Col>
          ))}
        </ul>
      </Row>
      <WarnModal
        setting={{
          show,
          handleClose: () => {
            setShow(false)
            handleToolChange({
              target: {
                name: 'step1',
                value: '計畫一覽表',
              },
            })
          },
        }}
      />
    </Container>
  )
}

ToolBar.propTypes = {
  setting: PropTypes.shape().isRequired,
}

WarnModal.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default ToolBar
