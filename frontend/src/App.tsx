import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/common/AppSidebar'
import './App.css'

function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <SidebarProvider defaultOpen={true}>
          <AppSidebar />
        </SidebarProvider>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<div> This is a test </div>} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App