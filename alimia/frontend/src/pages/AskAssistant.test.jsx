import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import AskAssistant from "./AskAssistant"

jest.mock("react-router-dom", () => ({
    useNavigate: () => jest.fn(),
}))

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche une erreur si la question est vide", () => {
    render(<AskAssistant />)

    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }))

    expect(screen.getByText("Merci de saisir une question")).toBeInTheDocument()
    expect(global.fetch).not.toHaveBeenCalled()
})

test("affiche la réponse en cas de succès", async () => {
    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ answer: "Les légumineuses sont une bonne source de protéines végétales." }),
    })

    render(<AskAssistant />)

    fireEvent.change(screen.getByPlaceholderText(/Posez une question/), {
        target: { value: "Quelle est une bonne source de protéines végétales ?" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }))

    await waitFor(() => {
        expect(screen.getByText("Les légumineuses sont une bonne source de protéines végétales.")).toBeInTheDocument()
    })
})

test("affiche une erreur si la requête échoue", async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, json: async () => ({}) })

    render(<AskAssistant />)

    fireEvent.change(screen.getByPlaceholderText(/Posez une question/), {
        target: { value: "Une question quelconque" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }))

    await waitFor(() => {
        expect(screen.getByText("Impossible d'obtenir une réponse pour le moment")).toBeInTheDocument()
    })
})

test("désactive le bouton et affiche l'état de chargement pendant la requête", async () => {
    let resolveFetch
    global.fetch.mockReturnValueOnce(
        new Promise((resolve) => {
            resolveFetch = resolve
        })
    )

    render(<AskAssistant />)

    fireEvent.change(screen.getByPlaceholderText(/Posez une question/), {
        target: { value: "Une question quelconque" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }))

    expect(screen.getByRole("button", { name: "Recherche en cours..." })).toBeDisabled()

    resolveFetch({
        ok: true,
        json: async () => ({ answer: "Réponse test" }),
    })

    await waitFor(() => {
        expect(screen.getByText("Réponse test")).toBeInTheDocument()
    })
})