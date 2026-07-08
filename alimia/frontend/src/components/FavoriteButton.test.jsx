import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import FavoriteButton from "./FavoriteButton"

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche un cœur blanc au départ", () => {
    render(<FavoriteButton recipe_id="recette-1" />)

    expect(screen.getByRole("button")).toHaveTextContent("🤍")
})

test("affiche un cœur rouge après un ajout réussi", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true })

    render(<FavoriteButton recipe_id="recette-1" />)
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
        expect(screen.getByRole("button")).toHaveTextContent("❤️")
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

    render(<FavoriteButton recipe_id="recette-1" />)
    fireEvent.click(screen.getByRole("button"))

    await waitFor(() => {
        expect(screen.getByText("Recette déjà enregistrée dans les favoris")).toBeInTheDocument()
    })

    expect(screen.getByRole("button")).toHaveTextContent("🤍")
})