import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Register() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(){
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
    <div>
      <h1>Inscription</h1>
      <input
      placeholder="firstname"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      />
      <input
      type="email"
      placeholder="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      />
      <input
      type="password"
      placeholder="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleSubmit}>Submit</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default Register