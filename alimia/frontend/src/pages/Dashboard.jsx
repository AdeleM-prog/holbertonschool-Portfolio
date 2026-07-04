import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

function Dashboard() {
    const navigate = useNavigate()
    const [menu, setMenu] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

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

    return (
        <div className="pb-20 lg:pb-6 px-4 lg:px-8">
            {loading && <p>Chargement...</p>}

            {!loading && error && (
                <div className="mt-6">
                    <p>Aucun menu disponible pour cette semaine.</p>
                    <button onClick={() => navigate('/menu_generation')} className="mt-2 bg-black text-white rounded-full px-4 py-2">
                        Générer un menu
                    </button>
                </div>
            )}

            {!loading && menu && (
                <div className="lg:grid lg:grid-cols-3 lg:gap-6 mt-6">
                    <div className="lg:col-span-2">

                        {/* VUE MOBILE */}
                        <div className="lg:hidden border border-gray-200 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Menu du jour</p>
                                    <p className="font-medium">
                                        {today.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </p>
                                </div>
                                <button onClick={() => navigate(`/weekly_menu/${menu.menu_id}`)} className="text-sm">
                                    Voir la semaine
                                </button>
                            </div>
                            {todayMeals.map((meal, index) => (
                                <div key={index} className="mt-3 bg-gray-50 rounded-lg p-3">
                                    <p className="text-xs text-gray-500">{meal.meal_type}</p>
                                    <p>{meal.recipe_title}</p>
                                </div>
                            ))}
                        </div>

                        {/* VUE DESKTOP */}
                        <div className="hidden lg:block">
                            <p className="font-medium text-lg mb-3">Menu de la semaine</p>
                            <div className="flex gap-2 mb-4">
                                {days.map((day, index) => {
                                    const dayStr = day.toISOString().split('T')[0]
                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedDate(dayStr)}
                                            className={selecteddate === dayStr ? "bg-black text-white rounded-full px-3 py-1" : "rounded-full px-3 py-1 border border-gray-200"}
                                        >
                                            {day.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })}
                                        </button>
                                    )
                                })}
                            </div>
                            <div className="border border-gray-200 rounded-xl p-4">
                                <p className="font-medium mb-3">
                                    {new Date(selecteddate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                </p>
                                {selectedMeals.map((meal, index) => (
                                    <div key={index} className="mb-3 bg-gray-50 rounded-lg p-3">
                                        <p className="text-xs text-gray-500">{meal.meal_type}</p>
                                        <p>{meal.recipe_title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CARTES D'ACCÈS RAPIDE */}
                    <div className="mt-4 lg:mt-0 flex flex-col gap-3">
                        <button
                            onClick={() => navigate(`/shopping_list/${menu.menu_id}`)}
                            className="text-left border border-gray-200 rounded-xl p-4"
                        >
                            <p className="font-medium">Liste de courses</p>
                            <p className="text-sm text-gray-500">Gérer vos achats</p>
                        </button>

                        <button
                            onClick={() => navigate('/ask_assistant')}
                            className="text-left border border-gray-200 rounded-xl p-4"
                        >
                            <p className="font-medium">Demander à l'IA</p>
                            <p className="text-sm text-gray-500">Posez vos questions</p>
                        </button>

                        <button onClick={() => navigate('/menu_generation')} className="bg-black text-white rounded-full px-4 py-3">
                            Générer un nouveau menu
                        </button>

                        <button onClick={() => navigate('/recipe_generation')} className="border border-gray-200 rounded-full px-4 py-3">
                            Dans mon frigo, il y a...
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Dashboard