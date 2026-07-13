import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import WeeklyMenu from "./WeeklyMenu"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useParams: () => ({ menu_id: undefined }),
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

const sampleMenu = {
    menu_id: "menu-1",
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

test("affiche Chargement avant la réponse", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<WeeklyMenu />)

    expect(screen.getByText("Chargement...")).toBeInTheDocument()
})

test("affiche un bouton de génération si aucun menu n'est disponible", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Générer un menu" })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Générer un menu" }))
    expect(mockNavigate).toHaveBeenCalledWith("/menu_generation")
})

test("affiche le menu et permet de déplier une recette", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleMenu })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByText("Soupe de légumes")[0])

    await waitFor(() => {
        expect(screen.getAllByText(/Carotte/).length).toBeGreaterThan(0)
    })
})

test("modifie le menu via l'IA et affiche le menu proposé", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleMenu })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    const draftMenu = {
        ...sampleMenu,
        meals: [{ ...sampleMenu.meals[0], recipe_title: "Soupe revisitée" }],
    }
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => draftMenu })

    fireEvent.click(screen.getByRole("button", { name: "Modifier via l'IA" }))

    await waitFor(() => {
        expect(screen.getByText("Menu proposé")).toBeInTheDocument()
    })

    expect(screen.getAllByText("Soupe revisitée").length).toBeGreaterThan(0)
})

test("valide le menu proposé et revient à la vue normale", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleMenu })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    const draftMenu = {
        ...sampleMenu,
        meals: [{ ...sampleMenu.meals[0], recipe_title: "Soupe revisitée" }],
    }
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => draftMenu })
    fireEvent.click(screen.getByRole("button", { name: "Modifier via l'IA" }))

    await waitFor(() => {
        expect(screen.getByText("Menu proposé")).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => draftMenu })
    fireEvent.click(screen.getByRole("button", { name: "Valider" }))

    await waitFor(() => {
        expect(screen.queryByText("Menu proposé")).not.toBeInTheDocument()
    })

    expect(screen.getAllByText("Soupe revisitée").length).toBeGreaterThan(0)
})

test("annule le menu proposé sans appel réseau", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleMenu })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    const draftMenu = {
        ...sampleMenu,
        meals: [{ ...sampleMenu.meals[0], recipe_title: "Soupe revisitée" }],
    }
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => draftMenu })
    fireEvent.click(screen.getByRole("button", { name: "Modifier via l'IA" }))

    await waitFor(() => {
        expect(screen.getByText("Menu proposé")).toBeInTheDocument()
    })

    const callsBeforeCancel = global.fetch.mock.calls.length

    fireEvent.click(screen.getByRole("button", { name: "Annuler" }))

    expect(screen.queryByText("Menu proposé")).not.toBeInTheDocument()
    expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    expect(global.fetch.mock.calls.length).toBe(callsBeforeCancel)
})

test("navigue vers la liste de courses", async () => {
    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => sampleMenu })

    render(<WeeklyMenu />)

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Voir la liste de courses" })).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Voir la liste de courses" }))
    expect(mockNavigate).toHaveBeenCalledWith("/shopping_list/menu-1")
})