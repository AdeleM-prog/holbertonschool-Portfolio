import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import SearchFood from "./FoodSearch"

jest.mock("../components/FoodCard", () => ({ food_id, name }) => (
    <div data-testid="food-card">{name}</div>
))

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche les suggestions quand la recherche est vide", () => {
    render(<SearchFood />)

    expect(screen.getByRole("button", { name: "Poulet" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Riz" })).toBeInTheDocument()
    expect(screen.queryByTestId("food-card")).not.toBeInTheDocument()
})

test("lance une recherche au clic sur une suggestion", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
            { food_id: "1", name: "Poulet rôti", calories: 190, proteins: 27, carbs: 0, fats: 8 },
        ]),
    })

    render(<SearchFood />)

    fireEvent.click(screen.getByRole("button", { name: "Poulet" }))

    await waitFor(() => {
        expect(screen.getByText("Poulet rôti")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/foods/search?q=Poulet",
        expect.objectContaining({ method: "GET" })
    )

    expect(screen.queryByRole("button", { name: "Riz" })).not.toBeInTheDocument()
})

test("affiche une erreur si la recherche échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    render(<SearchFood />)

    fireEvent.change(screen.getByPlaceholderText("Rechercher un aliment..."), {
        target: { value: "xyz" },
    })

    await waitFor(() => {
        expect(screen.getByText("Aliment introuvable")).toBeInTheDocument()
    })
})

test("réaffiche les suggestions et vide les résultats en effaçant la recherche", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([
            { food_id: "1", name: "Poulet rôti", calories: 190, proteins: 27, carbs: 0, fats: 8 },
        ]),
    })

    render(<SearchFood />)

    fireEvent.change(screen.getByPlaceholderText("Rechercher un aliment..."), {
        target: { value: "Poulet" },
    })

    await waitFor(() => {
        expect(screen.getByText("Poulet rôti")).toBeInTheDocument()
    })

    fireEvent.change(screen.getByPlaceholderText("Rechercher un aliment..."), {
        target: { value: "" },
    })

    await waitFor(() => {
        expect(screen.queryByTestId("food-card")).not.toBeInTheDocument()
    })

    expect(screen.getByRole("button", { name: "Poulet" })).toBeInTheDocument()
})