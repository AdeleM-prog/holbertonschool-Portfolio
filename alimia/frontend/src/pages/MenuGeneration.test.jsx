import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import MenuGeneration from "./MenuGeneration"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

const sampleMenu = {
    menu_id: null,
    type: "daily",
    start_date: "2026-07-08",
    end_date: "2026-07-08",
    meals: [
        {
            date: "2026-07-08",
            meal_type: "dinner",
            recipe_title: "Soupe de légumes",
            recipe: {
                ingredients: [{ name: "Carotte", quantity: 200, unit: "g" }],
                steps: ["Éplucher", "Cuire"],
            },
        },
    ],
}

test("affiche une erreur si aucune durée n'est sélectionnée", () => {
    render(<MenuGeneration />)

    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    expect(screen.getByText("Merci de sélectionner une durée")).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
})

test("génère un menu et permet de déplier une recette", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleMenu,
    })

    render(<MenuGeneration />)

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "daily" } })
    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    const mealTitles = screen.getAllByText("Soupe de légumes")
    fireEvent.click(mealTitles[0])

    await waitFor(() => {
        expect(screen.getAllByText(/Carotte/).length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText("1. Éplucher").length).toBeGreaterThan(0)
})

test("affiche une erreur si la génération échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    render(<MenuGeneration />)

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "daily" } })
    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    await waitFor(() => {
        expect(screen.getByText("Génération du menu impossible")).toBeInTheDocument()
    })
})

test("modifie le menu via l'IA", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleMenu,
    })

    render(<MenuGeneration />)

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "daily" } })
    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    const updatedMenu = {
        ...sampleMenu,
        meals: [{ ...sampleMenu.meals[0], recipe_title: "Soupe revisitée" }],
    }
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedMenu,
    })

    const instructionsInputs = screen.getAllByRole("textbox")
    fireEvent.change(instructionsInputs[instructionsInputs.length - 1], {
        target: { value: "Moins salé" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Modifier via l'IA" }))

    await waitFor(() => {
        expect(screen.getAllByText("Soupe revisitée").length).toBeGreaterThan(0)
    })

    expect(global.fetch).toHaveBeenLastCalledWith(
        "/api/menus/update-draft",
        expect.objectContaining({
            body: JSON.stringify({
                menu: sampleMenu,
                instructions: "Moins salé",
                priority_ingredients: null,
            }),
        })
    )
})

test("sauvegarde le menu et redirige vers la semaine", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleMenu,
    })

    render(<MenuGeneration />)

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "daily" } })
    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menu_id: "menu-42" }),
    })

    fireEvent.click(screen.getByRole("button", { name: "Valider le menu" }))

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/weekly_menu/menu-42")
    })
})

test("affiche une erreur si la sauvegarde échoue", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => sampleMenu,
    })

    render(<MenuGeneration />)

    fireEvent.change(screen.getByRole("combobox"), { target: { value: "daily" } })
    fireEvent.click(screen.getByRole("button", { name: "Générer le menu" }))

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    fireEvent.click(screen.getByRole("button", { name: "Valider le menu" }))

    await waitFor(() => {
        expect(screen.getByText("Sauvegarde impossible")).toBeInTheDocument()
    })
})