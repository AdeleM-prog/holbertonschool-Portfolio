import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Dashboard from "./Dashboard"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}))

function getTodayStr() {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

test("affiche Chargement avant la réponse", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<Dashboard />)

    expect(screen.getByText("Chargement...")).toBeInTheDocument()
})

test("affiche un message et un bouton si aucun menu n'est disponible", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false })

    render(<Dashboard />)

    await waitFor(() => {
        expect(screen.getByText("Aucun menu disponible pour cette semaine.")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Générer un menu" }))
    expect(mockNavigate).toHaveBeenCalledWith("/menu_generation")
})

test("affiche le repas du jour et permet de voir la semaine", async () => {
    const todayStr = getTodayStr()

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            menu_id: "menu-1",
            start_date: todayStr,
            end_date: todayStr,
            meals: [
                { date: todayStr, meal_type: "dinner", recipe_title: "Soupe de légumes" },
            ],
        }),
    })

    render(<Dashboard />)

    await waitFor(() => {
        expect(screen.getAllByText("Soupe de légumes").length).toBeGreaterThan(0)
    })

    expect(screen.getAllByText("dinner").length).toBeGreaterThan(0)

    fireEvent.click(screen.getByRole("button", { name: "Voir la semaine" }))
    expect(mockNavigate).toHaveBeenCalledWith("/weekly_menu/menu-1")
})

test("les boutons d'accès rapide déclenchent la bonne navigation", async () => {
    const todayStr = getTodayStr()

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            menu_id: "menu-1",
            start_date: todayStr,
            end_date: todayStr,
            meals: [],
        }),
    })

    render(<Dashboard />)

    await waitFor(() => {
        expect(screen.getByText("Liste de courses")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Liste de courses"))
    expect(mockNavigate).toHaveBeenCalledWith("/shopping_list/menu-1")

    fireEvent.click(screen.getByText("Demander à l'IA"))
    expect(mockNavigate).toHaveBeenCalledWith("/ask_assistant")

    fireEvent.click(screen.getByRole("button", { name: "Générer un nouveau menu" }))
    expect(mockNavigate).toHaveBeenCalledWith("/menu_generation")

    fireEvent.click(screen.getByRole("button", { name: "Dans mon frigo, il y a..." }))
    expect(mockNavigate).toHaveBeenCalledWith("/recipe_generation")
})