import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"

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

    return (
        <div>
            {draftMenu ? (
                <div>
                    <h2>Menu proposé</h2>

                    {/* VUE MOBILE */}
                    <div className="lg:hidden">
                        <div className="flex gap-2">
                            {draftDays.map((day, index) => (
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
                            {draftMenu.meals
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
                            {draftDays.map((day, index) => (
                                <div key={index} className="border border-gray-200 rounded-xl p-3">
                                    <p className="font-medium text-sm mb-2">
                                        {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                    </p>
                                    {draftMenu.meals
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

                    <button onClick={handleSave} disabled={loading}>{loading ? "Sauvegarde en cours..." : "Valider"}</button>
                    <button onClick={handleUpdateDraft}>Recommencer</button>
                    <button onClick={() => setDraftMenu(null)}>Annuler</button>
                </div>
            ) : (
                <div>
                    <h1>Menu de la semaine</h1>
                    {loading && <p>Chargement...</p>}
                    {error && <button onClick={() => navigate('/menu_generation')}>Générer un menu</button>}
                    {weekmenu && (
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
                                    {weekmenu.meals
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
                                            {weekmenu.meals
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
                            <input
                                placeholder="Ingrédients à utiliser en priorité + date de péremption"
                                value={prioringredients}
                                onChange={(e) => setPriorIngredients(e.target.value)}
                            />
                            <button onClick={handleUpdateDraft}>Modifier via l'IA</button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WeeklyMenu