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
        <div>
            <h1>Liste de courses</h1>
            {loading && <p>Chargement...</p>}
            {error && <p>{error}</p>}

            {!loading && !items && !error && (
                <div>
                    <p>Aucune liste de courses générée pour ce menu.</p>
                    <button onClick={handleGenerate}>Générer la liste de courses</button>
                </div>
            )}

            {items && (
                <div>
                    {items.map((item) => (
                        <label key={item.item_id} className={item.checked ? "flex items-center gap-2 opacity-50 line-through" : "flex items-center gap-2"}>
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => handleToggleCheck(item)}
                            />
                            {item.ingredient} - {item.quantity} {item.unit}
                        </label>
                    ))}
                    <button onClick={handleGenerate}>Régénérer la liste</button>
                    <button onClick={() => navigate(-1)}>Retour au menu</button>
                </div>
            )}
        </div>
    )
}

export default ShoppingList