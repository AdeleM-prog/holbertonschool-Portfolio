import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"

function Navbar() {
    const navigate = useNavigate()
    const location = useLocation()
    const [firstName, setFirstName] = useState("")

    useEffect(() => {
        async function fetchProfile(){
            const response = await fetch('/api/users/me', {
                method: 'GET',
                credentials: 'include'
            })
            if (response.ok){
                const data = await response.json()
                setFirstName(data.first_name || "")
            }
        }
        fetchProfile()
    }, [])

    const initial = firstName ? firstName.charAt(0).toUpperCase() : "?"

    const links = [
        { label: "Accueil", path: "/dashboard" },
        { label: "Recherche", path: "/foodsearch" },
        { label: "Favoris", path: "/favorites" },
    ]

    const mobileLinks = [
        ...links,
        { label: "Profil", path: "/profile" },
    ]

    function isActive(path){
        return location.pathname === path
    }

    return (
        <div>
            {/* VUE DESKTOP */}
            <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-200">
                <p className="font-bold text-lg">Alimia</p>
                <div className="flex gap-6">
                    {links.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={isActive(link.path) ? "font-medium" : "text-gray-400"}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
                <button onClick={() => navigate("/profile")} className="w-10 h-10 rounded-full bg-gray-400 text-white">
                    {initial}
                </button>
            </div>

            {/* VUE MOBILE */}
            <div className="lg:hidden flex items-center justify-between px-4 py-4">
                <p className="font-bold text-lg">Alimia</p>
                <button onClick={() => navigate("/profile")} className="w-9 h-9 rounded-full bg-gray-400 text-white">
                    {initial}
                </button>
            </div>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 border-t border-gray-200 bg-white">
                {mobileLinks.map((link) => (
                    <button
                        key={link.path}
                        onClick={() => navigate(link.path)}
                        className={isActive(link.path) ? "font-medium" : "text-gray-400"}
                    >
                        {link.label}
                    </button>
                ))}
            </div>
        </div>
    )
}

export default Navbar