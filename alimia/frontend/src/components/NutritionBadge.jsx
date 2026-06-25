function NutritionBadge({ label, value, unit }) {
    return (
        <div className="bg-gray-100 rounded-lg p-3">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-lg font-medium">{value ?? 0} <span className="text-xs font-normal text-gray-500">{unit}</span></p>
        </div>
    )
}

export default NutritionBadge