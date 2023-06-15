import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'

function Step2({ setting }) {
  console.log(setting)

  return <Container />
}

Step2.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step2
