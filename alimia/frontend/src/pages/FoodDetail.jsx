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

    if (!food) return <div>Chargement...</div>

    return (
    <div>
        <h1>{food.name}</h1>
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
        <NutritionBadge label="Magnesium" value={food.magnesium} unit="mg" />
        <NutritionBadge label="Vitamine A" value={food.vitamin_a} unit="µg" />
        <NutritionBadge label="Vitamine C" value={food.vitamin_c} unit="mg" />
        <NutritionBadge label="Vitamine D" value={food.vitamin_d} unit="µg" />
        <NutritionBadge label="Vitamine E" value={food.vitamin_e} unit="mg" />
        <NutritionBadge label="Vitamine B9" value={food.vitamin_b9} unit="µg" />
        <NutritionBadge label="Vitamine B12" value={food.vitamin_b12} unit="µg" />
    </div>
)

}

export default FoodDetail