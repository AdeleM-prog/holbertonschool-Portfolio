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
        <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
            <div className="max-w-2xl mx-auto pt-6">
                <button onClick={() => navigate(-1)} className="text-sm text-muted mb-4">
                    Retour
                </button>
                <h1 className="text-lg font-medium text-ink mb-4">Demander à l'IA</h1>

                <textarea
                    placeholder="Posez une question sur votre alimentation, votre menu, la nutrition..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full bg-white border border-line rounded-xl p-3 min-h-24 text-ink"
                />
                <button
                    onClick={handleAsk}
                    disabled={loading}
                    className="mt-3 bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2"
                >
                    {loading ? "Recherche en cours..." : "Envoyer"}
                </button>

                {error && <p className="mt-3 text-sm text-coral">{error}</p>}

                {answer && (
                    <div className="mt-6 bg-white border border-line rounded-xl p-4 whitespace-pre-line text-ink">
                        {answer}
                    </div>
                )}
            </div>
        </div>
    )
}

export default AskAssistant