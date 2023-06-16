import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Container, Row } from 'react-bootstrap'
import { Welcome, Home } from './pages'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { NavBar } from './components'

function App() {
  const handleLogin = (data) => {
    console.log(data)
    window.location.replace('/Home')
  }
  const handleLogout = () => {
    window.location.replace('/')
  }

  return (
    <div
      className="App"
      style={{
        height: '100vh',
        width: '100vw',
      }}
    >
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
        <Row className="flex-grow-1">
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
            </Routes>
          </Router>
        </Row>
      </Container>
    </div>
  )
}

export default App
