import { useState } from "react"

function Register() {

  const [firstName, setFirstName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(){
      const response = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, email: email, password: password })
      });
      const data = await response.json()
      if (response.ok === false) {
        
      }
  }

  return (
    <div>
      <input
      placeholder="firstname"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      />
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
    </div>
  )
}

export default Register