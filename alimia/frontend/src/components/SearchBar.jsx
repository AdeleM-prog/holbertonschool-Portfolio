function SearchBar({ value, onChange, onClear }) {
    return (
        <div className="flex items-center border border-gray-200 rounded-xl px-4 py-2 gap-3 bg-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 shrink-0">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
            className="flex-1 outline-none text-base bg-transparent"
            placeholder="Rechercher un aliment..."
            value={value}
            onChange={onChange}
            />
            {value && (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 cursor-pointer shrink-0" onClick={onClear}>
                    <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
            )}
        </div>
    )
}

export default SearchBar