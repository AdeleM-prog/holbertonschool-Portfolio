function SuggestionTag({ label, onClick }) {
    return (
        <button 
            onClick={onClick}
            className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 hover:bg-gray-200 cursor-pointer"
        >
            {label}
        </button>
    )
}

export default SuggestionTag