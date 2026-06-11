import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(){
    const response = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    });
    const data = await response.json()
    if (response.ok === false){
      setError("Email ou mot de passe incorrect")
    }
    else if (response.ok === true){
      navigate('/dashboard')
    }
  }
  return (
    <div>
      <h1>Connexion</h1>
      <input
      placeholder="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      />
      <input
      placeholder="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default Login