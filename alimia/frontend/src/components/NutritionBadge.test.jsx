import { render, screen } from "@testing-library/react"
import NutritionBadge from "./NutritionBadge"

test("affiche le label, la valeur et l'unité", () => {
    render(<NutritionBadge label="Calories" value={250} unit="kcal" />)

    expect(screen.getByText("Calories")).toBeInTheDocument()
    expect(screen.getByText("250")).toBeInTheDocument()
    expect(screen.getByText("kcal")).toBeInTheDocument()
})

test("affiche 0 si la valeur est absente", () => {
    render(<NutritionBadge label="Protéines" value={null} unit="g" />)

    expect(screen.getByText("0")).toBeInTheDocument()
})