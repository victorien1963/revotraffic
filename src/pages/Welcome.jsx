import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Row, Image, Container, Form, Button } from 'react-bootstrap'
import { RTLogo } from '../assets'

function Welcome({ setting }) {
  const { handleLogin } = setting
  const [data, setdata] = useState({
    id: '',
    password: '',
  })
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  const form = [
    {
      name: 'id',
      label: '帳號',
      placeholder: '',
      type: 'text',
    },
    {
      name: 'password',
      label: '密碼',
      placeholder: '',
      type: 'password',
    },
  ]
  useEffect(() => {
    setdata(form.reduce((prev, cur) => ({ ...prev, [cur.name]: '' }), {}))
  }, [])

  return (
    <Container
      fluid
      className="welcomePage d-flex h-100"
      style={{ cursor: 'pointer' }}
    >
      <div className="m-auto">
        <Row className="py-0">
          <Image src={RTLogo} />
        </Row>
        <Row className="fs-4 fw-light mt-0 pt-0">
          {form.map((f, i) => (
            <React.Fragment key={i}>
              <Form.Label>{f.label}</Form.Label>
              <Form.Control
                name={f.name}
                type={f.type}
                value={data[f.name]}
                onChange={onDataChange}
                placeholder={f.placeholder}
              />
            </React.Fragment>
          ))}
          <Button onClick={() => handleLogin(data)}>登入</Button>
        </Row>
      </div>
    </Container>
  )
}

Welcome.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Welcome
