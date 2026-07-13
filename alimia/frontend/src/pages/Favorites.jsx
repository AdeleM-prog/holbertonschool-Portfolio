import { useState, useEffect } from "react"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"
import FavoriteButton from "../components/FavoriteButton"

function Favorites() {
    const [recipeList, setRecipeList] = useState([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [expandedRecipe, setExpandedRecipe] = useState(null)

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

    function toggleRecipe(id){
        setExpandedRecipe(expandedRecipe === id ? null : id)
    }

    function handleRemove(recipe_id){
        setRecipeList(recipeList.filter(recipe => recipe.recipe_id !== recipe_id))
    }

    return (
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
            <h1 className="text-xl font-medium text-ink pt-6 mb-4">Recettes favorites</h1>
            {loading && <p className="text-muted">Chargement...</p>}
            {error && <p className="text-coral">{error}</p>}

            <div className="flex flex-col gap-3">
                {recipeList.map((recipe) => (
                    <div key={recipe.id} className="bg-white border border-line rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                            <div onClick={() => toggleRecipe(recipe.id)} className="flex-1 cursor-pointer">
                                <h2 className="font-medium text-ink">{recipe.title}</h2>
                            </div>
                            <FavoriteButton
                                recipe_id={recipe.recipe_id}
                                initialFavorite={true}
                                onRemove={handleRemove}
                            />
                        </div>
                        {expandedRecipe === recipe.id && (
                            <div className="mt-3 pt-3 border-t border-line">
                                <IngredientList ingredients={recipe.ingredients} />
                                <div className="flex flex-col divide-y divide-line">
                                    {recipe.steps.map((step, index) => (
                                        <RecipeStep key={index} text={step} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Favorites