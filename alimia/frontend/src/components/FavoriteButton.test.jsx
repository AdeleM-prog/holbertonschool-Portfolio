import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import FavoriteButton from "./FavoriteButton"

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche un cœur inactif au départ", () => {
    const { container } = render(<FavoriteButton recipe_id="recette-1" />)
    const icon = container.querySelector("svg")

    expect(icon).toHaveClass("text-coral-inactive")
    expect(icon).toHaveAttribute("fill", "none")
})

test("affiche un cœur actif après un ajout réussi", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true })

    const { container } = render(<FavoriteButton recipe_id="recette-1" />)
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
        const icon = container.querySelector("svg")
        expect(icon).toHaveClass("text-coral")
        expect(icon).toHaveAttribute("fill", "currentColor")
    })

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/users/me/favorites/recette-1",
        expect.objectContaining({
            method: "POST",
            credentials: "include",
        })
    )
})

test("affiche un message d'erreur si l'ajout échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false })

    const { container } = render(<FavoriteButton recipe_id="recette-1" />)
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
        expect(screen.getByText("Recette déjà enregistrée dans les favoris")).toBeInTheDocument()
    })

    const icon = container.querySelector("svg")
    expect(icon).toHaveClass("text-coral-inactive")
})