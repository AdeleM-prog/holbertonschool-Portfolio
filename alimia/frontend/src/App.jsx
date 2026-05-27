import { useState, useEffect } from "react"

function App() {
  const [status, setStatus] = useState("Chargement...")

  useEffect(() => {
    fetch("http://localhost:8000/health")
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(() => setStatus("Erreur de connexion"))
  }, [])

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-700">Alimia</h1>
        <p className="text-gray-500 mt-2">L'application nutritionnelle personnalisée</p>
        <p className="mt-4 text-sm text-gray-400">Status API : <span className="font-bold text-green-600">{status}</span></p>
      </div>
    </div>
  )
}

export default App
