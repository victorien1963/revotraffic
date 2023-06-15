import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'

function Step3({ setting }) {
  console.log(setting)

  return <Container />
}

Step3.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step3
