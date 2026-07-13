import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Login from "./Login"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
    Link: ({ to, children, ...props }) => <a href={to} {...props}>{children}</a>,
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

test("redirige vers /dashboard après une connexion réussie", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user_id: "1" }),
    })

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "camille@example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), {
        target: { value: "MotDePasseSolide123!" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/dashboard")
    })

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/login",
        expect.objectContaining({
            method: "POST",
            body: JSON.stringify({ email: "camille@example.com", password: "MotDePasseSolide123!" }),
        })
    )
})

test("affiche une erreur si les identifiants sont incorrects", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "unvalid credentials" }),
    })

    render(<Login />)

    fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "camille@example.com" },
    })
    fireEvent.change(screen.getByPlaceholderText("Mot de passe"), {
        target: { value: "MauvaisMotDePasse" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Se connecter" }))

    await waitFor(() => {
        expect(screen.getByText("Email ou mot de passe incorrect")).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
})