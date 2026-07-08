import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import ShoppingList from "./ShoppingList"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useParams: () => ({ menu_id: "menu-1" }),
    useNavigate: () => mockNavigate,
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

test("affiche le bouton de génération si aucune liste n'existe", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByText("Aucune liste de courses générée pour ce menu.")).toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: "Générer la liste de courses" })).toBeInTheDocument()
})

test("affiche les articles d'une liste existante", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: false },
            ],
        }),
    })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByText(/Tomate/)).toBeInTheDocument()
    })

    expect(screen.getByText(/150 g/)).toBeInTheDocument()
})

test("coche un article et applique le style correspondant", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: false },
            ],
        }),
    })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByRole("checkbox")).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: true }),
    })

    fireEvent.click(screen.getByRole("checkbox"))

    await waitFor(() => {
        expect(screen.getByRole("checkbox")).toBeChecked()
    })

    expect(screen.getByRole("checkbox").closest("label")).toHaveClass("opacity-50")
})

test("affiche une erreur si la récupération échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 500 })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByText("Impossible de récupérer la liste de courses")).toBeInTheDocument()
    })
})

test("génère la liste au clic sur le bouton initial", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Générer la liste de courses" })).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: false },
            ],
        }),
    })

    fireEvent.click(screen.getByRole("button", { name: "Générer la liste de courses" }))

    await waitFor(() => {
        expect(screen.getByText(/Tomate/)).toBeInTheDocument()
    })
})

test("affiche une erreur si la génération échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 404 })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Générer la liste de courses" })).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
    })

    fireEvent.click(screen.getByRole("button", { name: "Générer la liste de courses" }))

    await waitFor(() => {
        expect(screen.getByText("Génération de la liste de courses impossible")).toBeInTheDocument()
    })
})

test("régénère la liste depuis une liste déjà existante", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: false },
            ],
        }),
    })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Régénérer la liste" })).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 200, unit: "g", checked: false },
            ],
        }),
    })

    fireEvent.click(screen.getByRole("button", { name: "Régénérer la liste" }))

    await waitFor(() => {
        expect(screen.getByText(/200 g/)).toBeInTheDocument()
    })
})

test("revient en arrière au clic sur Retour au menu", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            items: [
                { item_id: "1", ingredient: "Tomate", quantity: 150, unit: "g", checked: false },
            ],
        }),
    })

    render(<ShoppingList />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Retour au menu" })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Retour au menu" }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
})