import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GamePage from './pages/GamePage'
import ResultPage from './pages/ResultPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import SurveyPage from './pages/SurveyPage'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/result" element={<ResultPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/survey" element={<SurveyPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
