import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Profile from "./Profile"

function calculateAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--
    }
    return age
}

const sampleProfile = {
    first_name: "Camille",
    email: "camille@example.com",
    gender: "Femme",
    birth_date: "1995-06-15",
    household_size: 2,
    meals: ["Déjeuner", "Dîner"],
    dietary_constraints: ["Aucune"],
    diet_type: ["Aucun"],
}

function mockInitialLoad({ profile = sampleProfile, members = [], liked = [], disliked = [] } = {}) {
    global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => profile })
        .mockResolvedValueOnce({ ok: true, json: async () => members })
        .mockResolvedValueOnce({ ok: true, json: async () => liked })
        .mockResolvedValueOnce({ ok: true, json: async () => disliked })
}

beforeEach(() => {
    global.fetch = jest.fn()
})

test("affiche le profil en mode lecture après le chargement", async () => {
    mockInitialLoad({
        members: [{ id: "m1", first_name: "Léo", gender: "Homme", birth_date: "2015-03-20" }],
        liked: [{ food_id: "f1", name: "Pomme" }],
        disliked: [{ food_id: "f2", name: "Coriandre" }],
    })

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    expect(screen.getByText("camille@example.com")).toBeInTheDocument()
    expect(screen.getByText(String(calculateAge("1995-06-15")))).toBeInTheDocument()
    expect(screen.getByText("Pomme")).toBeInTheDocument()
    expect(screen.getByText("Coriandre")).toBeInTheDocument()
    expect(screen.getByText(/Léo Homme/)).toBeInTheDocument()
})

test("passe en mode édition, modifie le prénom et enregistre", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }))

    const firstNameInput = screen.getByPlaceholderText("Prénom")
    fireEvent.change(firstNameInput, { target: { value: "Camille Modifiée" } })

    global.fetch
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({ ok: true, json: async () => ({ ...sampleProfile, first_name: "Camille Modifiée" }) })

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }))

    await waitFor(() => {
        expect(screen.getByText("Camille Modifiée")).toBeInTheDocument()
    })

    expect(global.fetch).toHaveBeenCalledWith(
        "/api/users/me",
        expect.objectContaining({ method: "PATCH" })
    )
})

test("ajoute un membre du foyer", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }))

    fireEvent.change(screen.getByPlaceholderText("Prénom du membre"), {
        target: { value: "Léo" },
    })

    global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ member_id: "m1" }) })

    fireEvent.click(screen.getByRole("button", { name: "Ajouter un membre" }))

    await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
            "/api/users/me/household-members/",
            expect.objectContaining({ method: "POST" })
        )
    })
})

test("supprime un membre du foyer", async () => {
    mockInitialLoad({
        members: [{ id: "m1", first_name: "Léo", gender: "Homme", birth_date: "2015-03-20" }],
    })

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }))

    global.fetch.mockResolvedValueOnce({ ok: true })

    fireEvent.click(screen.getByText("✕"))

    await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
            "/api/users/me/household-members/m1",
            expect.objectContaining({ method: "DELETE" })
        )
    })
})

test("recherche et ajoute un aliment préféré", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier" }))

    const searchInputs = screen.getAllByPlaceholderText("Rechercher un aliment")
    fireEvent.change(searchInputs[0], { target: { value: "Pomme" } })

    global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ([{ food_id: "f1", name: "Pomme" }]),
    })

    const searchButtons = screen.getAllByRole("button", { name: "Rechercher" })
    fireEvent.click(searchButtons[0])

    await waitFor(() => {
        expect(screen.getByRole("button", { name: "Pomme" })).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({ ok: true })

    fireEvent.click(screen.getByRole("button", { name: "Pomme" }))

    await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
            "/api/users/me/liked-foods/",
            expect.objectContaining({ method: "POST" })
        )
    })
})

test("change le mot de passe avec succès", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier le mot de passe" }))

    fireEvent.change(screen.getByPlaceholderText("Mot de passe actuel"), {
        target: { value: "AncienMotDePasse123!" },
    })
    fireEvent.change(screen.getByPlaceholderText("Nouveau mot de passe"), {
        target: { value: "NouveauMotDePasse123!" },
    })

    global.fetch.mockResolvedValueOnce({ ok: true })

    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => {
        expect(screen.queryByPlaceholderText("Mot de passe actuel")).not.toBeInTheDocument()
    })
})

test("affiche une erreur si le changement de mot de passe échoue", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByRole("button", { name: "Modifier le mot de passe" }))

    fireEvent.change(screen.getByPlaceholderText("Mot de passe actuel"), {
        target: { value: "MauvaisMotDePasse" },
    })
    fireEvent.change(screen.getByPlaceholderText("Nouveau mot de passe"), {
        target: { value: "NouveauMotDePasse123!" },
    })

    global.fetch.mockResolvedValueOnce({ ok: false })

    fireEvent.click(screen.getByRole("button", { name: "Confirmer" }))

    await waitFor(() => {
        expect(screen.getByText("Echec de la mise à jour du mot de passe")).toBeInTheDocument()
    })
})

test("déclenche l'appel de déconnexion", async () => {
    mockInitialLoad()

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({ ok: true })

    fireEvent.click(screen.getByRole("button", { name: "Se déconnecter" }))

    await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
            "/api/auth/logout",
            expect.objectContaining({ method: "POST" })
        )
    })
})

test("supprime le compte après confirmation", async () => {
    mockInitialLoad()
    global.confirm = jest.fn(() => true)

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    global.fetch.mockResolvedValueOnce({ ok: true })

    fireEvent.click(screen.getByRole("button", { name: "Supprimer le compte" }))

    await waitFor(() => {
        expect(global.fetch).toHaveBeenLastCalledWith(
            "/api/users/me",
            expect.objectContaining({ method: "DELETE" })
        )
    })
})

test("n'appelle pas la suppression si l'utilisateur annule la confirmation", async () => {
    mockInitialLoad()
    global.confirm = jest.fn(() => false)

    render(<Profile />)

    await waitFor(() => {
        expect(screen.getByText("Camille")).toBeInTheDocument()
    })

    const callsBeforeDelete = global.fetch.mock.calls.length

    fireEvent.click(screen.getByRole("button", { name: "Supprimer le compte" }))

    expect(global.fetch.mock.calls.length).toBe(callsBeforeDelete)
})