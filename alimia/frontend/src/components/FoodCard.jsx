import NutritionBadge from "./NutritionBadge"
import { useNavigate } from "react-router-dom"

function FoodCard({ food_id, name, calories, proteins, carbs, fats }) {
    const navigate = useNavigate()
    return (
        <div 
            className="bg-white border border-gray-200 rounded-xl p-4 mb-3 cursor-pointer hover:border-gray-400"
            onClick={() => navigate(`/food/${food_id}`)}
        >
            <p className="font-medium text-base mb-3">{name}</p>
            <div className="grid grid-cols-2 gap-2">
                <NutritionBadge label="Calories" value={calories} unit="kcal" />
                <NutritionBadge label="Protéines" value={proteins} unit="g" />
                <NutritionBadge label="Glucides" value={carbs} unit="g" />
                <NutritionBadge label="Lipides" value={fats} unit="g" />
            </div>
        </div>
    )
}

export default FoodCard
