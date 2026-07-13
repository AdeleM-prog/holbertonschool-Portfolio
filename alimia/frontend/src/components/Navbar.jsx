import { useState, useEffect, useRef } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Home, Search, Heart, User } from "lucide-react"
import logoIcone from "../assets/alimia_logo_icone.svg"
import logoComplet from "../assets/alimia_logo_complet.svg"

function AvatarMenu({ size, initial, onGoToAccount, onLogout }){
    const [menuOpen, setMenuOpen] = useState(false)
    const menuRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(event){
            if (menuRef.current && !menuRef.current.contains(event.target)){
                setMenuOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`${size} rounded-full bg-green flex items-center justify-center text-white font-medium`}
            >
                {initial}
            </button>
            {menuOpen && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-line rounded-xl shadow-md py-1 min-w-40 z-50">
                    <button
                        onClick={() => { setMenuOpen(false); onGoToAccount() }}
                        className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-cream"
                    >
                        Mon compte
                    </button>
                    <button
                        onClick={() => { setMenuOpen(false); onLogout() }}
                        className="w-full text-left px-4 py-2 text-sm text-coral hover:bg-cream"
                    >
                        Se déconnecter
                    </button>
                </div>
            )}
        </div>
    )
}

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
        { label: "Accueil", path: "/dashboard", inactiveClass: "text-green-inactive", icon: Home },
        { label: "Recherche", path: "/foodsearch", inactiveClass: "text-blue-inactive", icon: Search },
        { label: "Favoris", path: "/favorites", inactiveClass: "text-coral-inactive", icon: Heart },
    ]

    const mobileLinks = [
        ...links,
        { label: "Profil", path: "/profile", inactiveClass: "text-violet-inactive", icon: User },
    ]

    function isActive(path){
        return location.pathname === path
    }

    function linkClass(link){
        return isActive(link.path) ? "font-medium text-ink" : "text-muted"
    }

    async function handleLogout(){
        const response = await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        if (response.ok){
            window.location.href = '/login'
        }
    }

    function handleGoToAccount(){
        navigate('/profile')
    }

    return (
        <div>
            {/* VUE DESKTOP */}
            <div className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-line bg-white">
                <img src={logoComplet} alt="Alimia" className="h-20" />
                <div className="flex gap-6">
                    {links.map((link) => (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={linkClass(link)}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>
                <AvatarMenu size="w-10 h-10" initial={initial} onGoToAccount={handleGoToAccount} onLogout={handleLogout} />
            </div>

            {/* VUE MOBILE */}
            <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-line">
                <img src={logoIcone} alt="Alimia" className="h-24" />
                <AvatarMenu size="w-9 h-9" initial={initial} onGoToAccount={handleGoToAccount} onLogout={handleLogout} />
            </div>
            <div className="lg:hidden fixed bottom-0 left-0 right-0 flex justify-around py-3 border-t border-line bg-white">
                {mobileLinks.map((link) => {
                    const Icon = link.icon
                    return (
                        <button
                            key={link.path}
                            onClick={() => navigate(link.path)}
                            className={`flex flex-col items-center gap-1 text-xs ${isActive(link.path) ? "font-medium text-green" : link.inactiveClass}`}
                        >
                            <Icon size={20} strokeWidth={2} />
                            {link.label}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export default Navbar