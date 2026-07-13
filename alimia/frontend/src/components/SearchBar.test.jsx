import { render, screen, fireEvent } from "@testing-library/react"
import SearchBar from "./SearchBar"

test("affiche la valeur et déclenche onChange", () => {
    const handleChange = jest.fn()

    render(<SearchBar value="tomate" onChange={handleChange} onClear={() => {}} />)

    const input = screen.getByPlaceholderText("Rechercher un aliment...")
    expect(input).toHaveValue("tomate")

    fireEvent.change(input, { target: { value: "tomate cerise" } })
    expect(handleChange).toHaveBeenCalledTimes(1)
})

test("n'affiche pas l'icône d'effacement si la valeur est vide", () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} onClear={() => {}} />)

    expect(container.querySelector("svg.cursor-pointer")).not.toBeInTheDocument()
})

test("affiche l'icône d'effacement et déclenche onClear au clic", () => {
    const handleClear = jest.fn()

    const { container } = render(<SearchBar value="tomate" onChange={() => {}} onClear={handleClear} />)

    const clearIcon = container.querySelector("svg.cursor-pointer")
    expect(clearIcon).toBeInTheDocument()

    fireEvent.click(clearIcon)
    expect(handleClear).toHaveBeenCalledTimes(1)
})