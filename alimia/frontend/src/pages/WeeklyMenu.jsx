import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"
import FavoriteButton from "../components/FavoriteButton"
import { mealStyle } from "../utils/mealStyles"

function WeeklyMenu() {
    const { menu_id } = useParams()
    const [draftMenu, setDraftMenu] = useState(null)
    const [weekmenu, setWeekMenu] = useState(null)
    const today = new Date()
    const [selecteddate, setSelectedDate] = useState(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    )
    const [prioringredients, setPriorIngredients] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [expandedMeal, setExpandedMeal] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        async function get_menu(){
            setLoading(true)
            setError("")
            const url = menu_id ? `/api/menus/${menu_id}` : '/api/menus/current'
            const response = await fetch(url, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const data = await response.json()
            if (response.ok){
                setWeekMenu(data)
            } else {
                setError("Aucun menu disponible")
            }
            setLoading(false)
        }
        get_menu()
    }, [menu_id])

    const days = []
    if (weekmenu) {
        const start = new Date(weekmenu.start_date)
        const end = new Date(weekmenu.end_date)
        let current = new Date(start)
        while (current <= end) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
    }

    const draftDays = []
    if (draftMenu) {
        const start = new Date(draftMenu.start_date)
        const end = new Date(draftMenu.end_date)
        let current = new Date(start)
        while (current <= end) {
            draftDays.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
    }

    function toggleMeal(key){
        setExpandedMeal(expandedMeal === key ? null : key)
    }

    async function handleUpdateDraft(){
        setLoading(true)
        setError("")
        const response = await fetch('/api/menus/update-draft', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                menu: weekmenu,
                instructions: prioringredients || null,
                priority_ingredients: prioringredients || null
            })
        })
        const data = await response.json()
        if (response.ok){
            setDraftMenu(data)
            setExpandedMeal(null)
        } else {
            setError("Modification du menu impossible")
        }
        setLoading(false)
    }

    function handlePriorIngredientsKeyDown(e){
        if (e.key === "Enter") {
            handleUpdateDraft()
        }
    }

    async function handleSave(){
        setLoading(true)
        const response = await fetch(`/api/menus/${weekmenu.menu_id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({
                instructions: prioringredients || null,
                priority_ingredients: prioringredients || null
            })
        })
        const data = await response.json()
        if (response.ok){
            setWeekMenu(data)
            setDraftMenu(null)
            setExpandedMeal(null)
        } else {
            setError("Sauvegarde impossible")
        }
        setLoading(false)
    }

    function renderMealCard(meal, index, key, showFavorite){
        const style = mealStyle(meal.meal_type)
        const Icon = style.icon
        return (
            <div key={index} className="border-b border-line last:border-0">
                <div className="py-1.5 flex items-center gap-3">
                    <div onClick={() => toggleMeal(key)} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${style.bg} ${style.text}`}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                    <div onClick={() => toggleMeal(key)} className="flex-1 cursor-pointer">
                        <p className="text-xs text-muted">{meal.meal_type}</p>
                        <p className="text-ink">{meal.recipe_title}</p>
                    </div>
                    {showFavorite && meal.recipe_id && (
                        <FavoriteButton recipe_id={meal.recipe_id} />
                    )}
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
            {draftMenu ? (
                <div className="pt-0 lg:pt-6">
                    <h2 className="text-lg font-medium text-ink mb-0.5">Menu proposé</h2>

                    {/* VUE MOBILE */}
                    <div className="lg:hidden">
                        <div className="flex gap-2 mb-0.5">
                            {draftDays.map((day, index) => {
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
                            {draftMenu.meals
                                .filter(meal => meal.date === selecteddate)
                                .map((meal, index) => renderMealCard(meal, index, `${meal.date}_${meal.meal_type}`, false))}
                        </div>
                    </div>

                    {/* VUE DESKTOP */}
                    <div className="hidden lg:block">
                        <div className="grid grid-cols-7 gap-2">
                            {draftDays.map((day, index) => (
                                <div key={index} className="bg-white border border-line rounded-2xl p-3">
                                    <p className="font-medium text-sm mb-2 text-ink">
                                        {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                    {draftMenu.meals
                                        .filter(meal => meal.date === day.toISOString().split('T')[0])
                                        .map((meal, mealIndex) => renderMealCard(meal, mealIndex, `${meal.date}_${meal.meal_type}`, false))}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-0.5">
                        <button onClick={handleSave} disabled={loading} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                            {loading ? "Sauvegarde en cours..." : "Valider"}
                        </button>
                        <button onClick={handleUpdateDraft} className="border border-line text-ink rounded-full px-4 py-2">
                            Recommencer
                        </button>
                        <button onClick={() => setDraftMenu(null)} className="text-coral rounded-full px-4 py-2">
                            Annuler
                        </button>
                    </div>
                </div>
            ) : (
                <div className="pt-0 lg:pt-6">
                    <h1 className="text-xl font-medium text-ink mb-0.5">Menu de la semaine</h1>
                    {loading && <p className="text-muted">Chargement...</p>}
                    {error && (
                        <button onClick={() => navigate('/menu_generation')} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                            Générer un menu
                        </button>
                    )}
                    {weekmenu && (
                        <div>
                            {/* VUE MOBILE */}
                            <div className="lg:hidden">
                                <div className="flex gap-2 mb-0.5">
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
                                    {weekmenu.meals
                                        .filter(meal => meal.date === selecteddate)
                                        .map((meal, index) => renderMealCard(meal, index, `${meal.date}_${meal.meal_type}`, true))}
                                </div>
                            </div>

                            {/* VUE DESKTOP */}
                            <div className="hidden lg:block">
                                <div className="grid grid-cols-7 gap-2">
                                    {days.map((day, index) => (
                                        <div key={index} className="bg-white border border-line rounded-2xl p-3">
                                            <p className="font-medium text-sm mb-2 text-ink">
                                                {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                            </p>
                                            {weekmenu.meals
                                                .filter(meal => meal.date === day.toISOString().split('T')[0])
                                                .map((meal, mealIndex) => renderMealCard(meal, mealIndex, `${meal.date}_${meal.meal_type}`, true))}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* COMMUN AUX DEUX VUES */}
                            <div className="bg-white border border-line rounded-2xl p-4 mt-0.5">
                                <input
                                    placeholder="Ingrédients à utiliser en priorité + date de péremption"
                                    value={prioringredients}
                                    onChange={(e) => setPriorIngredients(e.target.value)}
                                    onKeyDown={handlePriorIngredientsKeyDown}
                                    className="w-full border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green"
                                />
                                <div className="flex gap-3 mt-3">
                                    <button onClick={handleUpdateDraft} className="border border-line text-ink rounded-full px-4 py-2">
                                        Modifier via l'IA
                                    </button>
                                    <button onClick={() => navigate(`/shopping_list/${weekmenu.menu_id}`)} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                                        Voir la liste de courses
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WeeklyMenu