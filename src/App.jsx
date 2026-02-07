// App.js
import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LoginComponent from './components/LoginComponent'
import MusicPlayer from './components/music/MusicPlayer'
import './App.css'
import Test from './components/HomePage'
import HomePage from './components/HomePage'
import AdminPanel from './components/admin/AdminPanel'
import MusicAdminDashboard from './components/admin/MusicAdminDashboard'

function App() {
  const [count, setCount] = useState(0)

  return ( <>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/music" element={<MusicPlayer />} />
         <Route path="/dashboard" element={<MusicAdminDashboard />} />
        {/* <Route path="/" element={<Navigate to="/music" replace />} /> */}
        
      </Routes>
    </Router>

    </>
  )
}

export default App