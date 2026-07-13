import { render, screen } from "@testing-library/react"
import RecipeStep from "./RecipeStep"

test("affiche le texte de l'étape sans numéro", () => {
    render(<RecipeStep text="Cuire à feu doux" />)

    expect(screen.getByText("Cuire à feu doux")).toBeInTheDocument()
})