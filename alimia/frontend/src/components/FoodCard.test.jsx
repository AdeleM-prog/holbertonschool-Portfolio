import { render, screen, fireEvent } from "@testing-library/react"
import FoodCard from "./FoodCard"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}))

beforeEach(() => {
    mockNavigate.mockClear()
})

test("affiche le nom et les valeurs nutritionnelles", () => {
    render(
        <FoodCard
            food_id="123"
            name="Pomme"
            calories={52}
            proteins={0.3}
            carbs={14}
            fats={0.2}
        />
    )

    expect(screen.getByText("Pomme")).toBeInTheDocument()
    expect(screen.getByText("52")).toBeInTheDocument()
    expect(screen.getByText("0.3")).toBeInTheDocument()
    expect(screen.getByText("14")).toBeInTheDocument()
    expect(screen.getByText("0.2")).toBeInTheDocument()
})

test("navigue vers la fiche aliment au clic", () => {
    render(
        <FoodCard
            food_id="123"
            name="Pomme"
            calories={52}
            proteins={0.3}
            carbs={14}
            fats={0.2}
        />
    )

    fireEvent.click(screen.getByText("Pomme"))

    expect(mockNavigate).toHaveBeenCalledWith("/food/123")
})