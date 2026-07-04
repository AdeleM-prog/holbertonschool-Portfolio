import { useState } from "react"
import { useNavigate } from "react-router-dom"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"

function MenuGeneration() {
    const navigate = useNavigate()
    const [menu_type, setMenuType] = useState("")
    const [start_date, setStartDate] = useState("")
    const [ingredients, setIngredients] = useState("")
    const [generated_menu, setGeneratedMenu] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [expandedMeal, setExpandedMeal] = useState(null)
    const [instructions, setInstructions] = useState("")
    const [selecteddate, setSelectedDate] = useState("")

    async function handleGenerate(){
        if (!menu_type){
            setError("Merci de sélectionner une durée")
            return
        }
        setLoading(true)
        setError("")
        const response = await fetch('/api/menus/generate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ 
                type: menu_type, 
                start_date: start_date,
                priority_ingredients: ingredients || null
            })
        })
        const data = await response.json()
        if (response.ok){
            setGeneratedMenu(data)
            setExpandedMeal(null)
            setSelectedDate(data.start_date)
        } else {
            setError("Génération du menu impossible")
        }
        setLoading(false)
    }

    async function handleUpdateDraft(){
        setLoading(true)
        setError("")
        const response = await fetch('/api/menus/update-draft', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                menu: generated_menu,
                instructions: instructions,
                priority_ingredients: ingredients || null
            })
        })
        const data = await response.json()
        if (response.ok){
            setGeneratedMenu(data)
            setExpandedMeal(null)
            setInstructions("")
        } else {
            setError("Modification du menu impossible")
        }
        setLoading(false)
    }

    async function handleSave(){
        setLoading(true)
        setError("")
        const response = await fetch('/api/menus/', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(generated_menu)
        })
        const data = await response.json()
        if (response.ok){
            navigate(`/weekly_menu/${data.menu_id}`)
        } else {
            setError("Sauvegarde impossible")
        }
        setLoading(false)
    }

    function toggleMeal(key){
        setExpandedMeal(expandedMeal === key ? null : key)
    }

    const days = []
    if (generated_menu) {
        const start = new Date(generated_menu.start_date)
        const end = new Date(generated_menu.end_date)
        let current = new Date(start)
        while (current <= end) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
    }

    return (
        <div>
            <h1>Générer un menu</h1>
            <select value={menu_type} onChange={(e) => setMenuType(e.target.value)}>
                <option value="" disabled>Sélectionner une durée</option>
                <option value="daily">Pour une journée</option>
                <option value="weekly">Pour la semaine</option>
            </select>
            <input type="date" value={start_date} onChange={(e) => setStartDate(e.target.value)} />
            <p>Avez-vous des ingrédients à utiliser en priorité ?</p>
            <input value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            <button onClick={handleGenerate}>Générer le menu</button>
            {loading && <p>Génération en cours...</p>}
            {error && <p>{error}</p>}
            {generated_menu && (
                <div>
                    {/* VUE MOBILE */}
                    <div className="lg:hidden">
                        <div className="flex gap-2">
                            {days.map((day, index) => (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(day.toISOString().split('T')[0])}
                                    className={selecteddate === day.toISOString().split('T')[0] ? "bg-black text-white rounded-full px-3 py-1" : "rounded-full px-3 py-1"}
                                >
                                    {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                </button>
                            ))}
                        </div>
                        <div>
                            {generated_menu.meals
                                .filter(meal => meal.date === selecteddate)
                                .map((meal, index) => {
                                    const key = `${meal.date}_${meal.meal_type}`
                                    return (
                                        <div key={index}>
                                            <div onClick={() => toggleMeal(key)}>
                                                <p>{meal.meal_type}</p>
                                                <p>{meal.recipe_title}</p>
                                            </div>
                                            {expandedMeal === key && meal.recipe && (
                                                <div>
                                                    <IngredientList ingredients={meal.recipe.ingredients} />
                                                    {meal.recipe.steps.map((step, stepIndex) => (
                                                        <RecipeStep key={stepIndex} number={stepIndex + 1} text={step} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                        </div>
                    </div>

                    {/* VUE DESKTOP */}
                    <div className="hidden lg:block">
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((day, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-3">
                                    <p className="font-medium text-sm mb-2">
                                        {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                    {generated_menu.meals
                                        .filter(meal => meal.date === day.toISOString().split('T')[0])
                                        .map((meal, mealIndex) => {
                                            const key = `${meal.date}_${meal.meal_type}`
                                            return (
                                                <div key={mealIndex} className="mb-2 p-2 bg-gray-50 rounded-lg">
                                                    <div onClick={() => toggleMeal(key)}>
                                                        <p className="text-xs text-gray-500">{meal.meal_type}</p>
                                                        <p className="text-sm">{meal.recipe_title}</p>
                                                    </div>
                                                    {expandedMeal === key && meal.recipe && (
                                                        <div>
                                                            <IngredientList ingredients={meal.recipe.ingredients} />
                                                            {meal.recipe.steps.map((step, stepIndex) => (
                                                                <RecipeStep key={stepIndex} number={stepIndex + 1} text={step} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* COMMUN AUX DEUX VUES */}
                    <p>Souhaitez-vous modifier ce menu ?</p>
                    <input value={instructions} onChange={(e) => setInstructions(e.target.value)} />
                    <button onClick={handleUpdateDraft}>Modifier via l'IA</button>
                    <button onClick={handleSave}>Valider le menu</button>
                </div>
            )}
        </div>
    )
}

export default MenuGeneration