import { BrowserRouter, Routes, Route } from 'react-router-dom'
import WelcomePage from './pages/WelcomePage'
import ChatPage from './pages/ChatPage'
import ReportPage from './pages/ReportPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
