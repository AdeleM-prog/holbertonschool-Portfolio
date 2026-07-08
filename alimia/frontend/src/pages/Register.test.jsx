import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Register from "./Register"

const mockNavigate = jest.fn()

jest.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}))

beforeEach(() => {
    global.fetch = jest.fn()
    mockNavigate.mockClear()
})

function fillForm(firstName, email, password) {
    fireEvent.change(screen.getByPlaceholderText("firstname"), { target: { value: firstName } })
    fireEvent.change(screen.getByPlaceholderText("email"), { target: { value: email } })
    fireEvent.change(screen.getByPlaceholderText("password"), { target: { value: password } })
}

test("redirige vers /login après une inscription réussie", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user_id: "1" }),
    })

    render(<Register />)
    fillForm("Camille", "camille@example.com", "MotDePasseSolide123!")
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/login")
    })
})

test("affiche l'erreur d'email déjà utilisé", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: "Email already registered" }),
    })

    render(<Register />)
    fillForm("Camille", "doublon@example.com", "MotDePasseSolide123!")
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => {
        expect(screen.getByText("Email already registered")).toBeInTheDocument()
    })

    expect(mockNavigate).not.toHaveBeenCalled()
})

test("affiche un message générique si le mot de passe est trop court", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
            detail: [
                { loc: ["body", "password"], msg: "String should have at least 12 characters" },
            ],
        }),
    })

    render(<Register />)
    fillForm("Camille", "camille@example.com", "court")
    fireEvent.click(screen.getByRole("button", { name: "Submit" }))

    await waitFor(() => {
        expect(screen.getByText("Le mot de passe doit contenir au moins 12 caractères")).toBeInTheDocument()
    })
})