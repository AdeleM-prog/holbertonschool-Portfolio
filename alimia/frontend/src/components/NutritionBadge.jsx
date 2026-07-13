function NutritionBadge({ label, value, unit, color = "bg-green-soft" }) {
    return (
        <div className={`rounded-lg p-3 ${color}`}>
            <p className="text-xs text-muted mb-1">{label}</p>
            <p className="text-lg font-medium text-ink">{value ?? 0} <span className="text-xs font-normal text-muted">{unit}</span></p>
        </div>
    )
}

export default NutritionBadge