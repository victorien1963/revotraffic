/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row } from 'react-bootstrap'

function ToolBar({ setting }) {
  const { toolState, handleToolChange } = setting
  console.log(toolState)
  const tools = [
    {
      label: '首頁',
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
    },
    {
      label: '結果報表',
    },
  ]

  return (
    <Container fluid className="p-3">
      <Row>
        <ul className="breadcrumbs-two px-0">
          {tools.map((tool, i) => (
            <li
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
              >
                <span>
                  <strong>{tool.label}</strong>
                </span>
              </a>
              {tool.dropdowns && (
                <ul className="dropdown-menu">
                  {tool.dropdowns.map((d) => (
                    <li>
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
