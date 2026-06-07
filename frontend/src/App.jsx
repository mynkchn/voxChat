import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import HomePage   from './pages/HomePage'
import LoginPage  from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ChatPage   from './pages/ChatPage'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('voxchat_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/login"   element={<LoginPage />} />
        <Route path="/signup"  element={<SignupPage />} />
        <Route path="/chat"    element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
