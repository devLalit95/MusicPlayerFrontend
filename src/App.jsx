import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import MusicPlayerPage from './pages/MusicPlayerPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/music" element={<MusicPlayerPage />} />
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
