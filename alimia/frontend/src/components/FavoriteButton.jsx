import { useState } from "react"

function FavoriteButton({ recipe_id, initialFavorite = false, onRemove }) {
    const [isFavorite, setIsFavorite] = useState(initialFavorite)
    const [error, setError] = useState("")

    async function toggleFavorite(){
        setError("")
        if (isFavorite){
            const response = await fetch(`/api/users/me/favorites/${recipe_id}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            if (response.ok){
                setIsFavorite(false)
                if (onRemove){
                    onRemove(recipe_id)
                }
            } else {
                setError("Suppression impossible")
            }
        } else {
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
    }

    return (
        <div>
            <button onClick={toggleFavorite} className="p-1">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    className={isFavorite ? "text-coral" : "text-coral-inactive"}
                >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z"/>
                </svg>
            </button>
            {error && <p className="text-coral text-sm">{error}</p>}
        </div>
    )
}

export default FavoriteButton