function SuggestionTag({ label, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="px-4 py-2 bg-white border border-line rounded-full text-sm text-ink hover:bg-cream cursor-pointer"
        >
            {label}
        </button>
    )
}

export default SuggestionTag