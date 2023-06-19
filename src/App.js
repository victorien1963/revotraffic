/* eslint-disable import/no-extraneous-dependencies */
import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container, Row, Toast, ToastContainer } from 'react-bootstrap'
import { Welcome, Home } from './pages'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { NavBar } from './components'

function App() {
  const [toast, settoast] = useState({ show: false, text: '' })
  const handleLogin = (data) => {
    if (data.id === 'admin@sinotech.com.tw' && data.password === 'sinotech')
      window.location.replace('/Home')
    else settoast({ show: true, text: '帳 戶 密 碼 錯 誤' })
  }
  const handleLogout = () => {
    window.location.replace('/')
  }

  return (
    <div className="App overflow-hidden">
      <Container className="h-100 w-100 d-flex flex-column" fluid>
        {window.location.pathname !== '/' && (
          <Row className="Nav">
            <NavBar
              setting={{
                handleLogout,
              }}
            />
          </Row>
        )}
        <Row className="flex-grow-1 overflow-hidden">
          <Router>
            <Routes className="px-0">
              <Route
                path="/"
                element={
                  <Welcome
                    setting={{
                      handleLogin,
                    }}
                  />
                }
              />
              <Route path="/Home" element={<Home />} />
              <Route path="/*" element={<Home />} />
            </Routes>
          </Router>
        </Row>
        {window.location.pathname !== '/' && (
          <Row className="bg-revo2 py-2 text-light">
            <small>Copyright © 2023 RevoTraffic. all rights reserved.</small>
          </Row>
        )}
      </Container>
      <ToastContainer className="p-3" position="bottom-end">
        <Toast
          onClose={() => settoast({ ...toast, show: false })}
          show={toast.show}
          delay={3000}
          autohide
          style={{ width: '100%' }}
        >
          <Toast.Body>{toast.text}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  )
}

export default App
