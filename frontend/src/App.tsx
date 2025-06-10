import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/common/Layout"
import DiagramsPage from "./components/diagrams"

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<div>This is a test</div>} />
          <Route path="/diagrams" element={<DiagramsPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App