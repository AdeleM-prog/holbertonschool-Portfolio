import { useState } from "react"


function MenuGeneration() {
    //
    const [menu_type, setMenuType] = useState("")
    const [start_date, setStartDate] = useState("")
    const [ingredients, setIngredients] = useState("")
    const [generated_menu, setGeneratedMenu] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleGenerate(){
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
        } else {
            setError("Génération du menu impossible")
        }
        setLoading(false)
    }

    
    return (
        <div>
            <h1>Générer un menu</h1>

            <select value={menu_type} onChange={(e) => setMenuType(e.target.value)}>
                <option value="daily">Pour une journée</option>
                <option value="weekly">Pour la semaine</option>
            </select>
            <input type="date" value={start_date} onChange={(e) => setStartDate(e.target.value)}></input>
            <p>Avez-vous des ingrédients à utiliser en priorité ?</p>
            <input value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            <button onClick={handleGenerate}>Générer la recette</button>
            {loading && <p>Génération en cours...</p>}
            {error && <p>{error}</p>}
            {generated_menu && (
                <div>
                    {generated_menu.meals.map((meal, index) => (
                        <div key={index}>
                            <p>{meal.date} — {meal.meal_type}</p>
                            <p>{meal.recipe_title}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
  )
}

export default MenuGeneration