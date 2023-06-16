import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'

function Breadcrumb({ setting }) {
  const { paths } = setting

  return (
    <Container fluid className="p-0">
      <Row>
        {paths.map((path, i) => (
          <>
            {i ? '>' : ''}
            <Col xs={2} key={i}>
              {path.label}
            </Col>
          </>
        ))}
      </Row>
    </Container>
  )
}

Breadcrumb.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Breadcrumb
