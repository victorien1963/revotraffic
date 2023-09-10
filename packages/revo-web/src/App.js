/* eslint-disable import/no-extraneous-dependencies */
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Row } from 'react-bootstrap'
import { Welcome, Home } from './pages'

import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'
import { AppWrapper, ContextProvider } from './components'

function App() {
  return (
    <div className="App overflow-hidden">
      <Router>
        <ContextProvider>
          <AppWrapper>
            <Row className="flex-grow-1 overflow-hidden">
              <Routes className="px-0">
                <Route path="/" element={<Welcome />} />
                <Route path="/Home" element={<Home />} />
                <Route path="/*" element={<Home />} />
              </Routes>
            </Row>
          </AppWrapper>
        </ContextProvider>
      </Router>
    </div>
  )
}

export default App
