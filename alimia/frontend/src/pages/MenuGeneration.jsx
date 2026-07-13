import { useState } from "react"
import { useNavigate } from "react-router-dom"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"
import { mealStyle } from "../utils/mealStyles"

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

    function renderMealCard(meal, index, key){
        const style = mealStyle(meal.meal_type)
        const Icon = style.icon
        return (
            <div key={index} className="border-b border-line last:border-0">
                <div onClick={() => toggleMeal(key)} className="py-3 flex items-center gap-3 cursor-pointer">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.bg} ${style.text}`}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="text-xs text-muted">{meal.meal_type}</p>
                        <p className="text-ink">{meal.recipe_title}</p>
                    </div>
                </div>
                {expandedMeal === key && meal.recipe && (
                    <div className="pb-3 pl-11">
                        <IngredientList ingredients={meal.recipe.ingredients} />
                        <div className="flex flex-col divide-y divide-line">
                            {meal.recipe.steps.map((step, stepIndex) => (
                                <RecipeStep key={stepIndex} text={step} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
            <div className="pt-6 max-w-2xl mx-auto">
                <h1 className="text-xl font-medium text-ink mb-4">Générer un menu</h1>

                <div className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
                    <select
                        value={menu_type}
                        onChange={(e) => setMenuType(e.target.value)}
                        className="border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                    >
                        <option value="" disabled>Sélectionner une durée</option>
                        <option value="daily">Pour une journée</option>
                        <option value="weekly">Pour la semaine</option>
                    </select>
                    <input
                        type="date"
                        value={start_date}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                    />
                    <div>
                        <p className="text-sm text-muted mb-1">Avez-vous des ingrédients à utiliser en priorité ?</p>
                        <input
                            value={ingredients}
                            onChange={(e) => setIngredients(e.target.value)}
                            className="w-full border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                        />
                    </div>
                    <button onClick={handleGenerate} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                        Générer le menu
                    </button>
                    {loading && <p className="text-muted text-sm">Génération en cours...</p>}
                    {error && <p className="text-coral text-sm">{error}</p>}
                </div>

                {generated_menu && (
                    <div className="mt-4">
                        <div className="flex gap-2 mb-4 flex-wrap">
                            {days.map((day, index) => {
                                const dayStr = day.toISOString().split('T')[0]
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedDate(dayStr)}
                                        className={selecteddate === dayStr ? "bg-green-pastel text-green-pastel-ink rounded-full px-3 py-1" : "rounded-full px-3 py-1 border border-line text-muted"}
                                    >
                                        {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                    </button>
                                )
                            })}
                        </div>
                        <div className="bg-white border border-line rounded-2xl p-4">
                            {generated_menu.meals
                                .filter(meal => meal.date === selecteddate)
                                .map((meal, index) => renderMealCard(meal, index, `${meal.date}_${meal.meal_type}`))}
                        </div>

                        <div className="bg-white border border-line rounded-2xl p-4 mt-4">
                            <p className="text-sm text-muted mb-1">Souhaitez-vous modifier ce menu ?</p>
                            <input
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                className="w-full border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                            />
                            <div className="flex gap-3 mt-3">
                                <button onClick={handleUpdateDraft} className="border border-line text-ink rounded-full px-4 py-2">
                                    Modifier via l'IA
                                </button>
                                <button onClick={handleSave} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                                    Valider le menu
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MenuGeneration