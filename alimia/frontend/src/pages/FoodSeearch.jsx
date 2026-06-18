import { useState, useEffect } from "react"


function SearchFood() {
    //
    const [research, setResearch] = useState("")
    const [results, setResults] = useState(null)
    const [error, setError] = useState("")


    async function handleResearch(){
        const response = await fetch(`/api/foods/search?q=${research}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
        })
        const data = await response.json()
        if (response.ok) {
            setResults(data)
        } else {
        setError("Aliment introuvable")
        }
    }


    return (
        <div>
            <h1>Recherche</h1>
            <input
              placeholder="Research"
              value={research}
              onChange={(e) => setResearch(e.target.value)}
            />
            <button onClick={handleResearch}>Rechercher</button>
        </div>
  )
}

export default SearchFood