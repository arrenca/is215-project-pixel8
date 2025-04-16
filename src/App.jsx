import './styles/Tailwind.css';
import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage"
import ArticlePage from "./pages/ArticlePage"

function App() {  
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/article-page" element={<ArticlePage />} />
        </Routes>
      </Router>
    </div>
  )
}

export default App
