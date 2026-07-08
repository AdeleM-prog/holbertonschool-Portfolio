import { render, screen, waitFor } from "@testing-library/react"
import Favorites from "./Favorites"

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche une recette favorite avec ses ingrédients et étapes", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
            {
                id: "1",
                title: "Salade de quinoa",
                ingredients: [
                    { name: "Quinoa", quantity: 100, unit: "g" },
                ],
                steps: ["Cuire le quinoa", "Servir froid"],
            },
        ]),
    })

    render(<Favorites />)

    await waitFor(() => {
        expect(screen.getByText("Salade de quinoa")).toBeInTheDocument()
    })

    expect(screen.getByText(/Quinoa - 100 g/)).toBeInTheDocument()
    expect(screen.getByText("1. Cuire le quinoa")).toBeInTheDocument()
    expect(screen.getByText("2. Servir froid")).toBeInTheDocument()
})

test("n'affiche aucune erreur si la liste est vide", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([]),
    })

    render(<Favorites />)

    await waitFor(() => {
        expect(screen.queryByText("Chargement...")).not.toBeInTheDocument()
    })

    expect(screen.queryByText("Liste de favoris introuvable")).not.toBeInTheDocument()
})

test("affiche une erreur si la récupération échoue", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
    })

    render(<Favorites />)

    await waitFor(() => {
        expect(screen.getByText("Liste de favoris introuvable")).toBeInTheDocument()
    })
})