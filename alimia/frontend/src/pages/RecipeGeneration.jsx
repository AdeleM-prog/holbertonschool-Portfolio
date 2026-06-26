import { useState } from "react"
import FavoriteButton from "../components/FavoriteButton"

function RecipeGeneration() {
    //
    const [input, setInput] = useState("")
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleGenerate(){
        setLoading(true)
        setError("")
        const response = await fetch('/api/recipes/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ ingredients: input ? input.split(",").map(i => i.trim()) : [] })
        })
        const data = await response.json()
        if (response.ok){
            setRecipe(data)
        } else {
            setError("Génération de la recette impossible")
        }
        setLoading(false)
    }

    return (
        <div>
            <h1>Générer une recette</h1>

            <input
            className="flex-1 outline-none text-base bg-transparent"
            placeholder="Ajouter des ingrédients..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            />
            <button onClick={handleGenerate}>Générer la recette</button>
            {loading && <p>Génération en cours...</p>}
            {error && <p>{error}</p>}
            {recipe && <div>
                {recipe.title}
                <FavoriteButton recipe_id={recipe.recipe_id} />
                {recipe.ingredients.map((ingredient, index) => (
                    <p key={index}>{index + 1}. {ingredient.name} - {ingredient.quantity} {ingredient.unit}</p>
                ))}
                {recipe.steps.map((step, index) => (
                    <p key={index}>{index + 1}. {step}</p>
                ))}
                </div>}
        </div>
  )
}

export default RecipeGeneration