/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row } from 'react-bootstrap'

function ToolBar({ setting }) {
  const { step, handleToolChange } = setting
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
          label: '計劃一覽表',
          name: 'step1',
          value: '計劃一覽表',
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
      ],
    },
    {
      label: 'AI影像辨識',
      name: 'step3',
      dropdowns: [
        {
          label: '影像辨識',
          name: 'step3',
          value: '影像辨識',
        },
        {
          label: '交通量檢核',
          name: 'step3',
          value: '交通量檢核',
        },
      ],
    },
    {
      label: 'AI號控調校',
      name: 'step4',
      click: {
        name: 'step4',
        value: 'selector',
      },
      // dropdowns: [
      //   {
      //     label: '模型上傳',
      //     name: 'step4',
      //     value: '模型上傳',
      //   },
      //   {
      //     label: '模型驅動',
      //     name: 'step4',
      //     value: '模型驅動',
      //   },
      // ],
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
                  if (tool.click)
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
                        onClick={() =>
                          handleToolChange({
                            target: {
                              name: d.name,
                              value: d.value,
                            },
                          })
                        }
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
    </Container>
  )
}

ToolBar.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default ToolBar