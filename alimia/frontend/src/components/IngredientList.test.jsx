import { render, screen } from "@testing-library/react"
import IngredientList from "./IngredientList"

test("affiche chaque ingrédient numéroté", () => {
    const ingredients = [
        { name: "Tomate", quantity: 200, unit: "g" },
        { name: "Basilic", quantity: 5, unit: "feuilles" },
    ]

    render(<IngredientList ingredients={ingredients} />)

    expect(screen.getByText("1. Tomate - 200 g")).toBeInTheDocument()
    expect(screen.getByText("2. Basilic - 5 feuilles")).toBeInTheDocument()
})