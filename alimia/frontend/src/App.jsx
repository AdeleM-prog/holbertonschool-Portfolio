import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Register from "./pages/Register.jsx"
import Login from "./pages/Login.jsx"
import ProtectedRoute from "./pages/ProtectedRoute.jsx"
import Profile from "./pages/Profile.jsx"
import SearchFood from "./pages/FoodSearch.jsx"
import FoodDetail from "./pages/FoodDetail.jsx"
import RecipeGeneration from "./pages/RecipeGeneration.jsx"
import Favorites from "./pages/Favorites.jsx"
import MenuGeneration from "./pages/MenuGeneration.jsx"
import WeeklyMenu from "./pages/WeeklyMenu.jsx"
import ShoppingList from "./pages/ShoppingList.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import AskAssistant from "./pages/AskAssistant.jsx"


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile/>
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard/>
          </ProtectedRoute>
        } />
        <Route path="/foodsearch" element={
          <ProtectedRoute>
            <SearchFood/>
          </ProtectedRoute>
        } />
        <Route path="/food/:food_id" element={
          <ProtectedRoute>
            <FoodDetail/>
          </ProtectedRoute>
        } />
        <Route path="/recipe_generation" element={
          <ProtectedRoute>
            <RecipeGeneration/>
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <Favorites/>
          </ProtectedRoute>
        } />
        <Route path="/menu_generation" element={
          <ProtectedRoute>
            <MenuGeneration/>
          </ProtectedRoute>
        } />
        <Route path="/weekly_menu" element={
          <ProtectedRoute>
            <WeeklyMenu/>
          </ProtectedRoute>
        } />
        <Route path="/weekly_menu/:menu_id" element={
          <ProtectedRoute>
            <WeeklyMenu/>
          </ProtectedRoute>
        } />
        <Route path="/shopping_list/:menu_id" element={
          <ProtectedRoute>
            <ShoppingList/>
          </ProtectedRoute>
        } />
        <Route path="/ask_assistant" element={
          <ProtectedRoute>
            <AskAssistant/>
          </ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App