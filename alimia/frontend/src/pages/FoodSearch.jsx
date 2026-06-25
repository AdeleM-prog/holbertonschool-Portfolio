import { useState, useEffect } from "react"
import NutritionBadge from "../components/NutritionBadge"
import SearchBar from "../components/SearchBar"
import SuggestionTag from "../components/SuggestionTag"
import FoodCard from "../components/FoodCard"


function SearchFood() {
    //
    const [research, setResearch] = useState("")
    const [results, setResults] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        if (!research) {
        setResults([])
        return
        }
        async function handleResearch(){
            const response = await fetch(`/api/foods/search?q=${research}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
            })
            const data = await response.json()
            if (response.ok) {
                setResults(data)
            } else {
            setError("Aliment introuvable")
            }
        }
        handleResearch()
    }, [research])


    return (
    <div className="p-4">
        <h1 className="text-xl font-medium mb-4">Recherche</h1>
        <SearchBar
            value={research}
            onChange={(e) => setResearch(e.target.value)}
            onClear={() => setResearch("")}
        />
        
        {!research && (
            <div className="flex flex-wrap gap-2 mt-4">
                <SuggestionTag label="Poulet" onClick={() => setResearch("Poulet")} />
                <SuggestionTag label="Riz" onClick={() => setResearch("Riz")} />
                <SuggestionTag label="Courgette" onClick={() => setResearch("Courgette")} />
                <SuggestionTag label="Saumon" onClick={() => setResearch("Saumon")} />
            </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}

        <div className="mt-4">
            {results.map((food) => (
                <FoodCard
                    key={food.food_id}
                    food_id={food.food_id}
                    name={food.name}
                    calories={food.calories}
                    proteins={food.proteins}
                    carbs={food.carbs}
                    fats={food.fats}
                />
            ))}
        </div>
    </div>
)
}

export default SearchFood