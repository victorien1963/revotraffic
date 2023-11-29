import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'

function Breadcrumb({ setting }) {
  const { paths } = setting

  return (
    <Container fluid className="p-0">
      <Row className="flex-nowrap">
        {paths.map((path, i) => (
          <React.Fragment key={i}>
            {i ? '>' : ''}
            <Col
              xs={3}
              className="oneLineEllipsis px-3"
              style={{
                cursor: 'pointer',
              }}
              onClick={path.onClick}
              title={path.label}
            >
              {path.label}
            </Col>
          </React.Fragment>
        ))}
      </Row>
    </Container>
  )
}

Breadcrumb.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Breadcrumb
