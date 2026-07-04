import { useState } from "react"
import { useNavigate } from "react-router-dom"

function AskAssistant() {
    const navigate = useNavigate()
    const [question, setQuestion] = useState("")
    const [answer, setAnswer] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    async function handleAsk(){
        if (!question.trim()){
            setError("Merci de saisir une question")
            return
        }
        setLoading(true)
        setError("")
        setAnswer("")
        const response = await fetch('/api/assistant/ask', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ question: question })
        })
        const data = await response.json()
        if (response.ok){
            setAnswer(data.answer)
        } else {
            setError("Impossible d'obtenir une réponse pour le moment")
        }
        setLoading(false)
    }

    return (
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 max-w-2xl mx-auto mt-6">
            <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-4">
                Retour
            </button>
            <h1 className="text-lg font-medium mb-4">Demander à l'IA</h1>

            <textarea
                placeholder="Posez une question sur votre alimentation, votre menu, la nutrition..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 min-h-24"
            />
            <button
                onClick={handleAsk}
                disabled={loading}
                className="mt-3 bg-black text-white rounded-full px-4 py-2"
            >
                {loading ? "Recherche en cours..." : "Envoyer"}
            </button>

            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

            {answer && (
                <div className="mt-6 bg-gray-50 rounded-xl p-4 whitespace-pre-line">
                    {answer}
                </div>
            )}
        </div>
    )
}

export default AskAssistant