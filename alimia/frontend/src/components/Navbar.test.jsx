import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Navbar from "./Navbar"

const mockNavigate = jest.fn()
let mockPathname = "/dashboard"

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: mockPathname }),
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
    mockPathname = "/dashboard"
})

test("affiche un point d'interrogation avant le chargement du profil", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<Navbar />)

    expect(screen.getAllByText("?")).toHaveLength(2)
})

test("affiche l'initiale du prénom une fois le profil chargé", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ first_name: "Camille" }),
    })

    render(<Navbar />)

    await waitFor(() => {
        expect(screen.getAllByText("C")).toHaveLength(2)
    })
})

test("applique le style actif au lien correspondant à la page courante", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))
    mockPathname = "/favorites"

    render(<Navbar />)

    const activeLinks = screen.getAllByRole("button", { name: "Favoris" })
    activeLinks.forEach((link) => {
        expect(link).toHaveClass("font-medium")
    })

    const inactiveLinks = screen.getAllByRole("button", { name: "Accueil" })
    expect(inactiveLinks).toHaveLength(2)
    expect(inactiveLinks[0]).toHaveClass("text-muted")
    expect(inactiveLinks[1]).toHaveClass("text-green-inactive")
})

test("navigue vers la bonne page au clic sur un lien", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<Navbar />)

    const links = screen.getAllByRole("button", { name: "Recherche" })
    fireEvent.click(links[0])

    expect(mockNavigate).toHaveBeenCalledWith("/foodsearch")
})

test("navigue vers /profile via le menu de l'avatar", () => {
    global.fetch.mockReturnValueOnce(new Promise(() => {}))

    render(<Navbar />)

    const avatars = screen.getAllByText("?")
    fireEvent.click(avatars[0])

    const accountButtons = screen.getAllByRole("button", { name: "Mon compte" })
    fireEvent.click(accountButtons[0])

    expect(mockNavigate).toHaveBeenCalledWith("/profile")
})