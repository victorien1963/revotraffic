import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Card, Dropdown } from 'react-bootstrap'

function ToolBar({ setting }) {
  const { toolState, handleToolChange } = setting
  console.log(toolState)
  const tools = [
    {
      label: '首頁',
      component: (
        <Dropdown className="my-auto w-100 h-100">
          <Dropdown.Toggle
            className="btn-outline-lucaLight px-1 fs-8 w-100 h-100"
            id="dropdown-basic"
            size="sm"
          >
            首頁
          </Dropdown.Toggle>

          <Dropdown.Menu className="px-3">
            {['操作流程圖', '計畫一覽表'].map((key) => (
              <Dropdown.Item
                onClick={() =>
                  handleToolChange({
                    target: {
                      name: 'step1',
                      value: key,
                    },
                  })
                }
              >
                {key}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      ),
    },
    {
      label: '影片上傳標記',
    },
    {
      label: 'AI影像辨識',
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
        {tools.map((tool) => (
          <Col>
            {tool.component || (
              <Card>
                <Card.Body>{tool.component || tool.label}</Card.Body>
              </Card>
            )}
          </Col>
        ))}
      </Row>
    </Container>
  )
}

ToolBar.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default ToolBar
