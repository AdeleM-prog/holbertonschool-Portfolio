import { render, screen, waitFor } from "@testing-library/react"
import FoodDetail from "./FoodDetail"

jest.mock("react-router-dom", () => ({
    useParams: () => ({ food_id: "123" }),
}))

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche Chargement avant la réponse", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<FoodDetail />)

    expect(screen.getByText("Chargement...")).toBeInTheDocument()
})

test("affiche le nom et les valeurs nutritionnelles une fois chargé", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
            name: "Pomme",
            energy_cal: 52,
            proteins: 0.3,
            carbohydrates: 14,
            sugars: 10,
            fats: 0.2,
            saturated_fats: 0,
            fiber: 2.4,
            sodium: 1,
            calcium: 6,
            iron: 0.1,
            magnesium: 5,
            vitamin_a: 3,
            vitamin_c: 4.6,
            vitamin_d: 0,
            vitamin_e: 0.2,
            vitamin_b9: 3,
            vitamin_b12: 0,
        }),
    })

    render(<FoodDetail />)

    await waitFor(() => {
        expect(screen.getByText("Pomme")).toBeInTheDocument()
    })

    expect(screen.getByText("52")).toBeInTheDocument()
})

test("affiche une erreur si l'aliment est introuvable", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
    })

    render(<FoodDetail />)

    await waitFor(() => {
        expect(screen.getByText("Aliment introuvable")).toBeInTheDocument()
    })
})