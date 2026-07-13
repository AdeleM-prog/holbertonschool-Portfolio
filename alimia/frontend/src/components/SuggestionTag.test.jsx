import { render, screen, fireEvent } from "@testing-library/react"
import SuggestionTag from "./SuggestionTag"

test("affiche le label et déclenche onClick", () => {
    const handleClick = jest.fn()

    render(<SuggestionTag label="Végétarien" onClick={handleClick} />)

    fireEvent.click(screen.getByRole("button", { name: "Végétarien" }))

    expect(handleClick).toHaveBeenCalledTimes(1)
})