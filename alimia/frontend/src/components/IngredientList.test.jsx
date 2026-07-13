import { render, screen } from "@testing-library/react"
import IngredientList from "./IngredientList"

test("affiche chaque ingrédient avec une puce", () => {
    const ingredients = [
        { name: "Tomate", quantity: 200, unit: "g" },
        { name: "Basilic", quantity: 5, unit: "feuilles" },
    ]
    render(<IngredientList ingredients={ingredients} />)

    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === "span" && element.textContent === "Tomate - 200 g")).toBeInTheDocument()
    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === "span" && element.textContent === "Basilic - 5 feuilles")).toBeInTheDocument()
})