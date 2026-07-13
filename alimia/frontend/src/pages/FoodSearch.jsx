import { useState, useEffect } from "react"
import SearchBar from "../components/SearchBar"
import SuggestionTag from "../components/SuggestionTag"
import FoodCard from "../components/FoodCard"


function SearchFood() {
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
    <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
        <div className="pt-6 max-w-2xl mx-auto">
            <h1 className="text-xl font-medium text-ink mb-4">Recherche</h1>
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

            {error && <p className="text-coral mt-4">{error}</p>}

            <div className="mt-4">
                {results.map((food, index) => (
                    <FoodCard
                        key={food.food_id}
                        food_id={food.food_id}
                        name={food.name}
                        calories={food.calories}
                        proteins={food.proteins}
                        carbs={food.carbs}
                        fats={food.fats}
                        index={index}
                    />
                ))}
            </div>
        </div>
    </div>
)
}

export default SearchFood