function IngredientList({ ingredients }) {
    return (
        <div>
            {ingredients.map((ingredient, index) => (
                <p key={index}>{index + 1}. {ingredient.name} - {ingredient.quantity} {ingredient.unit}</p>
            ))}
        </div>
    )
}

export default IngredientList