import React, { useState, useEffect, useContext } from 'react'
import { Row, Col, Image, Container, Form, Button } from 'react-bootstrap'
import { RTLogo4 } from '../assets'
import { AuthContext, ToastContext } from '../components/ContextProvider'
import apiServices from '../services/apiServices'

function Welcome() {
  const { auth, setAuth } = useContext(AuthContext)
  const { setToast } = useContext(ToastContext)
  console.log(auth)

  const [data, setdata] = useState({
    email: '',
    password: '',
  })
  const onDataChange = (e) =>
    setdata({ ...data, [e.target.name]: e.target.value })

  const form = [
    {
      name: 'email',
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

  const handleLogin = async () => {
    const { token } = await apiServices.login(data)
    if (!token) {
      setToast({ show: true, text: '登 入 失 敗' })
      return
    }
    document.cookie = `token=${token}; Domain=${window.location.hostname}; Path=/;`
    const { user } = await apiServices.me()
    setAuth({
      authed: true,
      ...user,
    })
  }

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
              <React.Fragment key={i}>
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

export default Welcome
