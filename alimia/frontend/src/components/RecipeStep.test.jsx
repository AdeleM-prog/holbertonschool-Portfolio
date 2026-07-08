import { render, screen } from "@testing-library/react"
import RecipeStep from "./RecipeStep"

test("affiche le numéro et le texte de l'étape", () => {
    render(<RecipeStep number={2} text="Cuire à feu doux" />)

    expect(screen.getByText("2. Cuire à feu doux")).toBeInTheDocument()
})