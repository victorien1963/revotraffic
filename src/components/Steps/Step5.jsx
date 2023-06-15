import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'

function Step5({ setting }) {
  console.log(setting)

  return <Container />
}

Step5.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step5
