import { useState } from "react"
import FavoriteButton from "../components/FavoriteButton"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"

function RecipeGeneration() {
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
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
            <div className="pt-6 max-w-2xl mx-auto">
                <h1 className="text-xl font-medium text-ink mb-4">Dans mon frigo, il y a...</h1>

                <div className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
                    <input
                        placeholder="Ajouter des ingrédients, séparés par une virgule..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="w-full border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                    />
                    <button onClick={handleGenerate} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                        Générer la recette
                    </button>
                    {loading && <p className="text-muted text-sm">Génération en cours...</p>}
                    {error && <p className="text-coral text-sm">{error}</p>}
                </div>

                {recipe && (
                    <div className="bg-white border border-line rounded-2xl p-4 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="font-medium text-ink">{recipe.title}</h2>
                            <FavoriteButton recipe_id={recipe.recipe_id} />
                        </div>
                        <IngredientList ingredients={recipe.ingredients} />
                        <div className="flex flex-col divide-y divide-line">
                            {recipe.steps.map((step, index) => (
                                <RecipeStep key={index} text={step} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default RecipeGeneration