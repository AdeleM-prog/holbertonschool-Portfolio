import { useState } from "react"

function FavoriteButton({ recipe_id }) {
    const [isFavorite, setIsFavorite] = useState(false)
    const [error, setError] = useState("")

    async function add_to_favorites(){
        const response = await fetch(`/api/users/me/favorites/${recipe_id}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        })
        if (response.ok){
            setIsFavorite(true)
        } else {
            setError("Recette déjà enregistrée dans les favoris")
        }
    }

    return (
        <button onClick={add_to_favorites}>
            {isFavorite ? "❤️" : "🤍"}
        </button>
    )
}

export default FavoriteButton