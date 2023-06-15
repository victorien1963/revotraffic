import React from 'react'
import PropTypes from 'prop-types'
import { Container } from 'react-bootstrap'

function Step4({ setting }) {
  console.log(setting)

  return <Container />
}

Step4.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Step4
