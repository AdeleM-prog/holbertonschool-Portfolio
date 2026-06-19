import { BrowserRouter, Routes, Route } from "react-router-dom"
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import ProtectedRoute from "./pages/ProtectedRoute.jsx"
import Profile from "./pages/Profile.jsx"
import SearchFood from "./pages/FoodSeearch.jsx"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div>Dashboard</div>
          </ProtectedRoute>
        } />
        <Route path="/foodsearch" element={
          <ProtectedRoute>
            <SearchFood/>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App