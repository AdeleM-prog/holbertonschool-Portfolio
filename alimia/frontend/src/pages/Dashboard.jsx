import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, Sparkles } from "lucide-react"
import { mealStyle } from "../utils/mealStyles"
import IngredientList from "../components/IngredientList"
import RecipeStep from "../components/RecipeStep"
import FavoriteButton from "../components/FavoriteButton"

function Dashboard() {
    const navigate = useNavigate()
    const [menu, setMenu] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [expandedMeal, setExpandedMeal] = useState(null)

    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    const [selecteddate, setSelectedDate] = useState(todayStr)

    useEffect(() => {
        async function fetchCurrentMenu(){
            setLoading(true)
            setError("")
            const response = await fetch('/api/menus/current', {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            if (response.ok){
                const data = await response.json()
                setMenu(data)
            } else {
                setError("Aucun menu disponible")
            }
            setLoading(false)
        }
        fetchCurrentMenu()
    }, [])

    const days = []
    if (menu) {
        const start = new Date(menu.start_date)
        const end = new Date(menu.end_date)
        let current = new Date(start)
        while (current <= end) {
            days.push(new Date(current))
            current.setDate(current.getDate() + 1)
        }
    }

    const todayMeals = menu ? menu.meals.filter(meal => meal.date === todayStr) : []
    const selectedMeals = menu ? menu.meals.filter(meal => meal.date === selecteddate) : []

    function toggleMeal(key){
        setExpandedMeal(expandedMeal === key ? null : key)
    }

    function renderMealRow(meal, index){
        const style = mealStyle(meal.meal_type)
        const Icon = style.icon
        const key = `${meal.date}_${meal.meal_type}`
        return (
            <div key={index} className="border-b border-line last:border-0">
                <div className="py-3 flex items-center gap-3">
                    <div onClick={() => toggleMeal(key)} className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 cursor-pointer ${style.bg} ${style.text}`}>
                        <Icon size={16} strokeWidth={2} />
                    </div>
                    <div onClick={() => toggleMeal(key)} className="flex-1 cursor-pointer">
                        <p className="text-xs opacity-70 text-muted">{meal.meal_type}</p>
                        <p className="text-ink">{meal.recipe_title}</p>
                    </div>
                    {meal.recipe_id && (
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
            {loading && <p className="text-muted mt-6">Chargement...</p>}

            {!loading && error && (
                <div className="mt-6">
                    <p className="text-ink">Aucun menu disponible pour cette semaine.</p>
                    <button onClick={() => navigate('/menu_generation')} className="mt-2 bg-green text-white rounded-full px-4 py-2">
                        Générer un menu
                    </button>
                </div>
            )}

            {!loading && menu && (
                <div className="lg:grid lg:grid-cols-3 lg:gap-6 mt-6">
                    <div className="lg:col-span-2">

                        {/* VUE MOBILE */}
                        <div className="lg:hidden bg-white border border-line rounded-2xl p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-muted">Menu du jour</p>
                                    <p className="font-medium text-ink">
                                        {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <button onClick={() => navigate(`/weekly_menu/${menu.menu_id}`)} className="text-sm text-green">
                                    Voir la semaine
                                </button>
                            </div>
                            {todayMeals.map((meal, index) => renderMealRow(meal, index))}
                        </div>

                        {/* VUE DESKTOP */}
                        <div className="hidden lg:block">
                            <p className="font-medium text-lg mb-3 text-ink">Menu de la semaine</p>
                            <div className="flex gap-2 mb-4">
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
                                <p className="font-medium mb-3 text-ink">
                                    {new Date(selecteddate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                {selectedMeals.map((meal, index) => renderMealRow(meal, index))}
                            </div>
                        </div>
                    </div>

                    {/* CARTES D'ACCÈS RAPIDE */}
                    <div className="mt-4 lg:mt-0 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-3 lg:flex lg:flex-col">
                            <button
                                onClick={() => navigate(`/shopping_list/${menu.menu_id}`)}
                                className="text-left bg-white border border-line rounded-2xl p-4 flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-full bg-violet-soft flex items-center justify-center text-violet-ink shrink-0">
                                    <ShoppingCart size={16} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="font-medium text-ink">Liste de courses</p>
                                    <p className="text-sm text-muted">Gérer vos achats</p>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/ask_assistant')}
                                className="text-left bg-white border border-line rounded-2xl p-4 flex items-center gap-3"
                            >
                                <div className="w-9 h-9 rounded-full bg-amber-soft flex items-center justify-center text-amber-ink shrink-0">
                                    <Sparkles size={16} strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="font-medium text-ink">Demander à l'IA</p>
                                    <p className="text-sm text-muted">Posez vos questions</p>
                                </div>
                            </button>
                        </div>

                        <button onClick={() => navigate('/menu_generation')} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-3">
                            Générer un nouveau menu
                        </button>

                        <button onClick={() => navigate('/recipe_generation')} className="border border-line text-ink rounded-full px-4 py-3">
                            Dans mon frigo, il y a...
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard