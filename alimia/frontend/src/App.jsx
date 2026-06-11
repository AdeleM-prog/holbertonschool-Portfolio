import { Routes, Route } from "react-router-dom"
import Register from "./pages/Register"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import ProtectedRoute from "./ProtectedRoute.jsx"

function App() {

  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    </Routes>
  )
}

export default App
