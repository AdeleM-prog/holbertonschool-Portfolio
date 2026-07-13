import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"

function ShoppingList() {
    const { menu_id } = useParams()
    const navigate = useNavigate()
    const [items, setItems] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    useEffect(() => {
        async function fetchShoppingList(){
            setLoading(true)
            setError("")
            const response = await fetch(`/api/menus/${menu_id}/shopping-list`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
                credentials: 'include'
            })
            if (response.ok){
                const data = await response.json()
                setItems(data.items)
            } else if (response.status === 404){
                setItems(null)
            } else {
                setError("Impossible de récupérer la liste de courses")
            }
            setLoading(false)
        }
        fetchShoppingList()
    }, [menu_id])

    async function handleGenerate(){
        setLoading(true)
        setError("")
        const response = await fetch(`/api/menus/${menu_id}/shopping-list`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include'
        })
        const data = await response.json()
        if (response.ok){
            setItems(data.items)
        } else {
            setError("Génération de la liste de courses impossible")
        }
        setLoading(false)
    }

    async function handleToggleCheck(item){
        const response = await fetch(`/api/menus/${menu_id}/shopping-list/items/${item.item_id}`, {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ checked: !item.checked })
        })
        if (response.ok){
            const updatedItem = await response.json()
            setItems(items.map(i => i.item_id === updatedItem.item_id ? updatedItem : i))
        }
    }

    return (
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
            <div className="pt-6 max-w-2xl mx-auto">
                <button onClick={() => navigate(-1)} className="text-green text-sm mb-2">
                    ‹ Retour au menu
                </button>
                <h1 className="text-xl font-medium text-ink mb-4">Liste de courses</h1>

                {loading && <p className="text-muted">Chargement...</p>}
                {error && <p className="text-coral">{error}</p>}

                {!loading && !items && !error && (
                    <div className="bg-white border border-line rounded-2xl p-4">
                        <p className="text-ink mb-3">Aucune liste de courses générée pour ce menu.</p>
                        <button onClick={handleGenerate} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                            Générer la liste de courses
                        </button>
                    </div>
                )}

                {items && (
                    <div className="bg-white border border-line rounded-2xl p-4">
                        {items.map((item) => (
                            <label
                                key={item.item_id}
                                className={item.checked
                                    ? "flex items-center gap-3 py-2 border-b border-line last:border-0 text-muted line-through cursor-pointer"
                                    : "flex items-center gap-3 py-2 border-b border-line last:border-0 text-ink cursor-pointer"
                                }
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => handleToggleCheck(item)}
                                    className="sr-only"
                                />
                                <span className={item.checked
                                    ? "w-5 h-5 rounded-md border-2 border-amber-ink bg-amber-soft flex items-center justify-center shrink-0"
                                    : "w-5 h-5 rounded-md border-2 border-amber-ink bg-white flex items-center justify-center shrink-0"
                                }>
                                    {item.checked && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-ink">
                                            <path d="M20 6 9 17l-5-5"/>
                                        </svg>
                                    )}
                                </span>
                                {item.ingredient} - {item.quantity} {item.unit}
                            </label>
                        ))}
                        <div className="flex gap-3 mt-4">
                            <button onClick={handleGenerate} className="border border-line text-ink rounded-full px-4 py-2">
                                Régénérer la liste
                            </button>
                            <button onClick={() => navigate(-1)} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                                Retour au menu
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ShoppingList