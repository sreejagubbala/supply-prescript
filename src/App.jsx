import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Operations from './pages/Operations'
import Shipments from './pages/Shipments'
import Suppliers from './pages/Suppliers'
import Analytics from './pages/Analytics'

function App() {
  return (
    <BrowserRouter>
      <div className="flex bg-gray-950 min-h-screen">
        <Sidebar />
        <div className="flex-1">
          <Header />
          <Routes>
            <Route path="/" element={<Operations />} />
            <Route path="/shipments" element={<Shipments />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App