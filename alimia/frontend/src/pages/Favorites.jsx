import { useState, useEffect } from "react"

function Favorites() {
    const [recipeList, setRecipeList] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function get_favorites(){
            setLoading(true)
            setError("")
            const response = await fetch('/api/users/me/favorites/', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const data = await response.json()
            if (response.ok){
                setRecipeList(data)
            } else {
                setError("Liste de favoris introuvable")
            }
            setLoading(false)
        }
        get_favorites()
    }, [])

    return (
    <div>
        <h1>Recettes favorites</h1>
        {loading && <p>Chargement...</p>}
        {error && <p>{error}</p>}
        {recipeList.map((recipe) => (
            <div key={recipe.id}>
                <h2>{recipe.title}</h2>
                <ul>
                    {recipe.steps.map((step, index) => (
                        <li key={index}>{index + 1}. {step}</li>
                    ))}
                </ul>
            </div>
        ))}
    </div>
    )
}

export default Favorites