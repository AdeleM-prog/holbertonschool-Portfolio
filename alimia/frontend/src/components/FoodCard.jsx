import NutritionBadge from "./NutritionBadge"
import { useNavigate } from "react-router-dom"

const CARD_COLORS = ["bg-green-soft", "bg-amber-soft", "bg-blue-soft", "bg-violet-soft"]

function FoodCard({ food_id, name, calories, proteins, carbs, fats, index = 0 }) {
    const navigate = useNavigate()
    const color = CARD_COLORS[index % CARD_COLORS.length]

    return (
        <div 
            className="bg-white border border-line rounded-xl p-4 mb-3 cursor-pointer hover:border-muted"
            onClick={() => navigate(`/food/${food_id}`)}
        >
            <p className="font-medium text-base mb-3 text-ink">{name}</p>
            <div className="grid grid-cols-2 gap-2">
                <NutritionBadge label="Calories" value={calories} unit="kcal" color={color} />
                <NutritionBadge label="Protéines" value={proteins} unit="g" color={color} />
                <NutritionBadge label="Glucides" value={carbs} unit="g" color={color} />
                <NutritionBadge label="Lipides" value={fats} unit="g" color={color} />
            </div>
        </div>
    )
}

export default FoodCard