import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Image, Container, Form, Button } from 'react-bootstrap'
import { RTLogo4 } from '../assets'

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
      label: '',
      placeholder: '帳號',
      type: 'text',
    },
    {
      name: 'password',
      label: '',
      placeholder: '密碼',
      type: 'password',
    },
  ]
  useEffect(() => {
    setdata(form.reduce((prev, cur) => ({ ...prev, [cur.name]: '' }), {}))
  }, [])

  return (
    <Container
      fluid
      className="welcomePage bg-revo-linear d-flex h-100"
      // style={{
      //   cursor: 'pointer',
      // }}
    >
      <div className="m-auto">
        <Row className="py-0">
          <Image
            src={RTLogo4}
            className="m-auto"
            style={{ width: '24rem', opacity: '.8' }}
          />
        </Row>
        <Row className="h6 fw-light mt-0 pt-0">
          <Col xs={9}>
            {form.map((f, i) => (
              <React.Fragment className="d-flex" key={i}>
                <Form.Control
                  name={f.name}
                  type={f.type}
                  value={data[f.name]}
                  onChange={onDataChange}
                  placeholder={f.placeholder}
                  size="sm"
                  className="m-2"
                  style={{ opacity: '.8' }}
                />
              </React.Fragment>
            ))}
          </Col>
          <Col xs={3} className="d-flex">
            <Button
              variant="outline-dark"
              size="md"
              className="m-auto"
              title="登入"
              onClick={() => handleLogin(data)}
            >
              登入
            </Button>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

Welcome.propTypes = {
  setting: PropTypes.shape().isRequired,
}

export default Welcome
