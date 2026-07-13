import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import logoComplet from "../assets/alimia_logo_complet.svg"

function Register() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(){
    setError("")
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ first_name: firstName, email: email, password: password })
    });
    const data = await response.json()
    if (response.ok === false){
      if (Array.isArray(data.detail)) {
        setError("Le mot de passe doit contenir au moins 12 caractères")
      } else {
        setError(data.detail)
      }
    }
    else if (response.ok === true){
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white border border-line rounded-2xl p-6">
        <img src={logoComplet} alt="Alimia" className="h-10 mx-auto mb-6" />
        <h1 className="text-lg font-medium text-ink mb-4 text-center">Créer un compte</h1>

        <div className="flex flex-col gap-3">
          <input
            placeholder="Prénom"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
          />
          <input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
          />
          <input
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
          />
        </div>

        {error && <p className="text-coral text-sm mt-3">{error}</p>}

        <button onClick={handleSubmit} className="w-full bg-green-pastel text-green-pastel-ink rounded-full py-2 mt-4">
          S'inscrire
        </button>

        <p className="text-sm text-muted text-center mt-4">
          Déjà un compte ?{" "}
          <Link to="/login" className="text-green font-medium">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register