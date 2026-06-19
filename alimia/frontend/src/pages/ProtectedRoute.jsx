import { useState, useEffect} from "react"
import { useNavigate } from "react-router-dom"


/**
 * ProtectedRoute - Composant de protection des routes privées
 * 
 * Vérifie si l'utilisateur est authentifié en appelant /auth/me.
 * Si authentifié → affiche le composant enfant (children)
 * Si non authentifié → redirige vers /login
 * 
 * @param {React.ReactNode} children - Le composant à afficher si l'utilisateur est connecté
 */

function ProtectedRoute({ children }) {

  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // vérification de la connexion
  useEffect(() => {
    async function checkAuth() {
      await new Promise(resolve => setTimeout(resolve, 100))
      const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include' //sending cookie in the request
    })
    // si connecté → afficher children
    // si non connecté → rediriger vers /login
    if (response.ok){
      setIsAuthenticated(true)
    }
    else {
      navigate('/login')
    }
    setIsLoading(false)
  }
  checkAuth()
  }, [])

  if (isLoading) return null
  if (!isAuthenticated) return null
  return children
}

export default ProtectedRoute