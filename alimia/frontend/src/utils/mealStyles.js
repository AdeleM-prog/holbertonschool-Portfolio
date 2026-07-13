import { Sun, Salad, Utensils } from "lucide-react"

export const MEAL_STYLES = {
    "Petit-déjeuner": { bg: "bg-amber-soft", text: "text-amber-ink", icon: Sun },
    "Collation matinale": { bg: "bg-amber-soft", text: "text-amber-ink", icon: Sun },
    "Déjeuner": { bg: "bg-green-soft", text: "text-green-icon", icon: Salad },
    "Goûter": { bg: "bg-amber-soft", text: "text-amber-ink", icon: Sun },
    "Dîner": { bg: "bg-blue-soft", text: "text-blue-icon", icon: Utensils },
}

export function mealStyle(mealType){
    return MEAL_STYLES[mealType] || { bg: "bg-green-soft", text: "text-green-icon", icon: Salad }
}