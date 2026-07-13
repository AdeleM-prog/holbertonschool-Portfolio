function IngredientList({ ingredients }) {
    return (
        <ul className="flex flex-col gap-1 mb-3">
            {ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-ink">
                    <span className="text-green mt-1.5 text-xs">●</span>
                    <span>{ingredient.name} - {ingredient.quantity} {ingredient.unit}</span>
                </li>
            ))}
        </ul>
    )
}

export default IngredientList