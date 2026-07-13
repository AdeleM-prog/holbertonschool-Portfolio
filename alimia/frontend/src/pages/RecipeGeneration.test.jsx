import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RecipeGeneration from "./RecipeGeneration"

jest.mock("../components/FavoriteButton", () => ({ recipe_id }) => (
    <button data-testid="favorite-button">Favori {recipe_id}</button>
))

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche la recette générée avec ingrédients, étapes et bouton favori", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            recipe_id: "42",
            title: "Salade de tomates",
            ingredients: [
                { name: "Tomate", quantity: 200, unit: "g" },
            ],
            steps: ["Couper les tomates", "Assaisonner"],
        }),
    })

    render(<RecipeGeneration />)

    fireEvent.change(screen.getByPlaceholderText("Ajouter des ingrédients, séparés par une virgule..."), {
        target: { value: "tomate, basilic" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Générer la recette" }))

    await waitFor(() => {
        expect(screen.getByText("Salade de tomates")).toBeInTheDocument()
    })

    expect(screen.getByText((content, element) => element.tagName.toLowerCase() === "span" && element.textContent === "Tomate - 200 g")).toBeInTheDocument()
    expect(screen.getByText("Couper les tomates")).toBeInTheDocument()
    expect(screen.getByTestId("favorite-button")).toHaveTextContent("Favori 42")

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/recipes/generate",
        expect.objectContaining({
            body: JSON.stringify({ ingredients: ["tomate", "basilic"] }),
        })
    )
})

test("envoie un tableau vide si aucun ingrédient n'est saisi", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            recipe_id: "42",
            title: "Recette surprise",
            ingredients: [],
            steps: [],
        }),
    })

    render(<RecipeGeneration />)

    fireEvent.click(screen.getByRole("button", { name: "Générer la recette" }))

    await waitFor(() => {
        expect(screen.getByText("Recette surprise")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/recipes/generate",
        expect.objectContaining({
            body: JSON.stringify({ ingredients: [] }),
        })
    )
})

test("affiche une erreur si la génération échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    render(<RecipeGeneration />)

    fireEvent.click(screen.getByRole("button", { name: "Générer la recette" }))

    await waitFor(() => {
        expect(screen.getByText("Génération de la recette impossible")).toBeInTheDocument()
    })
})

test("affiche l'état de chargement pendant la génération", async () => {
    let resolveFetch
    global.fetch.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFetch = resolve
        })
    )

    render(<RecipeGeneration />)

    fireEvent.click(screen.getByRole("button", { name: "Générer la recette" }))

    expect(screen.getByText("Génération en cours...")).toBeInTheDocument()

    resolveFetch({
        ok: true,
        json: async () => ({ recipe_id: "1", title: "Recette", ingredients: [], steps: [] }),
    })

    await waitFor(() => {
        expect(screen.getByText("Recette")).toBeInTheDocument()
    })
})