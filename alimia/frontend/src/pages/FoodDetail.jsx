import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import NutritionBadge from "../components/NutritionBadge"

function FoodDetail() {

    const { food_id } = useParams()
    const [food, setFood] = useState(null)
    const [error, setError] = useState("")

    useEffect(() => {
        async function get_food_details() {
            const response = await fetch(`/api/foods/${food_id}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'},
                credentials: 'include'
            })
            const data = await response.json()
            if (response.ok){
                setFood(data)
            } else {
                setError("Aliment introuvable")
            }
        }
        get_food_details()
    }, [food_id])

    if (error) return <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen pt-6 text-coral">{error}</div>
    if (!food) return <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen pt-6 text-muted">Chargement...</div>

    return (
    <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
        <div className="pt-6 max-w-2xl mx-auto">
            <div className="bg-white border border-line rounded-2xl p-4">
                <h1 className="text-lg font-medium text-ink mb-4">{food.name}</h1>
                <div className="grid grid-cols-2 gap-2">
                    <NutritionBadge label="Calories" value={food.energy_cal} unit="kcal" />
                    <NutritionBadge label="Protéines" value={food.proteins} unit="g" />
                    <NutritionBadge label="Glucides" value={food.carbohydrates} unit="g" />
                    <NutritionBadge label="Sucres" value={food.sugars} unit="g" />
                    <NutritionBadge label="Lipides" value={food.fats} unit="g" />
                    <NutritionBadge label="Graisses saturées" value={food.saturated_fats} unit="g" />
                    <NutritionBadge label="Fibres" value={food.fiber} unit="g" />
                    <NutritionBadge label="Sodium" value={food.sodium} unit="mg" />
                    <NutritionBadge label="Calcium" value={food.calcium} unit="mg" />
                    <NutritionBadge label="Fer" value={food.iron} unit="mg" />
                    <NutritionBadge label="Magnésium" value={food.magnesium} unit="mg" />
                    <NutritionBadge label="Vitamine A" value={food.vitamin_a} unit="µg" />
                    <NutritionBadge label="Vitamine C" value={food.vitamin_c} unit="mg" />
                    <NutritionBadge label="Vitamine D" value={food.vitamin_d} unit="µg" />
                    <NutritionBadge label="Vitamine E" value={food.vitamin_e} unit="mg" />
                    <NutritionBadge label="Vitamine B9" value={food.vitamin_b9} unit="µg" />
                    <NutritionBadge label="Vitamine B12" value={food.vitamin_b12} unit="µg" />
                </div>
            </div>
        </div>
    </div>
)

}

export default FoodDetail