import { render, screen, waitFor } from "@testing-library/react"
import ProtectedRoute from "./ProtectedRoute"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}))

jest.mock("../components/Navbar", () => () => <nav data-testid="navbar">Navbar</nav>)

beforeEach(() => {
    mockNavigate.mockClear()
})

test("n'affiche rien pendant la vérification initiale", () => {
    global.fetch = jest.fn(() => new Promise(() => {}))

    const { container } = render(
        <ProtectedRoute>
            <p>Contenu protégé</p>
        </ProtectedRoute>
    )

    expect(container).toBeEmptyDOMElement()
})

test("affiche le contenu et la navbar si authentifié", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: true })

    render(
        <ProtectedRoute>
            <p>Contenu protégé</p>
        </ProtectedRoute>
    )

    await waitFor(() => {
        expect(screen.getByText("Contenu protégé")).toBeInTheDocument()
    })

    expect(screen.getByTestId("navbar")).toBeInTheDocument()
})

test("redirige vers /login si non authentifié", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({ ok: false })

    render(
        <ProtectedRoute>
            <p>Contenu protégé</p>
        </ProtectedRoute>
    )

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login")
    })

    expect(screen.queryByText("Contenu protégé")).not.toBeInTheDocument()
})