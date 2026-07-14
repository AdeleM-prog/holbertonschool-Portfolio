import { useState, useEffect } from "react"

const DIET_TYPES = ["Aucun", "Végétarien", "Vegan", "Halal", "Casher"]
const DIETARY_CONSTRAINTS = ["Aucune", "Allergie aux fruits à coques", "Allergie aux arachides", "Intolérance au gluten / Maladie cœliaque", "Intolérance au lactose"]
const MEALS = ["Petit-déjeuner", "Collation matinale", "Déjeuner", "Goûter", "Dîner"]

function Profile() {
  const [profile, setProfile] = useState(null)
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState({ first_name: "", gender: "", date_of_birth: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [likedFoodSearch, setLikedFoodSearch] = useState("")
  const [dislikedFoodSearch, setDislikedFoodSearch] = useState("")
  const [likedFoodResults, setLikedFoodResults] = useState([])
  const [dislikedFoodResults, setDislikedFoodResults] = useState([])
  const [likedFoodsList, setLikedFoodsList] = useState([])
  const [dislikedFoodsList, setDislikedFoodsList] = useState([])
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordData, setPasswordData] = useState({ current_password: "", new_password: "" })

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await response.json()
        if (response.ok) {
          if (data.diet_type && !Array.isArray(data.diet_type)) {
            data.diet_type = []
          }
          if (data.meals && !Array.isArray(data.meals)) {
            data.meals = []
          }
          if (data.dietary_constraints && !Array.isArray(data.dietary_constraints)) {
            data.dietary_constraints = []
          }
          setProfile(data)
        } else {
          setError("Profil introuvable")
        }
      } catch (err) {
        setError("Profil introuvable")
      }
    }

    async function fetchMembers() {
      try {
        const response = await fetch('/api/users/me/household-members/', {
          method: 'GET',
          credentials: 'include'
        })
        const data = await response.json()
        if (response.ok) {
          setMembers(data)
        } else {
          setError("Membres du foyer non accessibles")
        }
      } catch (err) {
        setError("Membres du foyer non accessibles")
      }
    }

    async function fetchLikedFoods() {
      try {
        const response = await fetch('/api/users/me/liked-foods/', {
          method: 'GET',
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setLikedFoodsList(data)
        }
      } catch (err) {
        // silencieux, pas critique pour l'affichage du reste de la page
      }
    }

    async function fetchDislikedFoods() {
      try {
        const response = await fetch('/api/users/me/disliked-foods/', {
          method: 'GET',
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setDislikedFoodsList(data)
        }
      } catch (err) {
        // silencieux, pas critique pour l'affichage du reste de la page
      }
    }

    fetchProfile()
    fetchMembers()
    fetchLikedFoods()
    fetchDislikedFoods()
  }, [])

  function calculateAge(birthDate) {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  async function handleSave() {
    const profileToSend = {
      ...profile,
      diet_type: Array.isArray(profile.diet_type) ? profile.diet_type : [],
      meals: Array.isArray(profile.meals) ? profile.meals : [],
      dietary_constraints: Array.isArray(profile.dietary_constraints) ? profile.dietary_constraints : []
    }
    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profileToSend)
    })
    if (response.ok) {
      setIsEditing(false)
      const refreshResponse = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include'
      })
      const refreshData = await refreshResponse.json()
      setProfile(refreshData)
    } else {
      setError("Echec de la mise à jour du compte")
    }
  }

  async function handleAddMember() {
    const response = await fetch('/api/users/me/household-members/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newMember)
    })
    if (response.ok) {
      const data = await response.json()
      setMembers([...members, { ...newMember, id: data.member_id }])
      setNewMember({ first_name: "", gender: "", date_of_birth: "" })
    }
  }

  async function handleRemoveMember(member_id) {
  const response = await fetch(`/api/users/me/household-members/${member_id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  if (response.ok) {
    setMembers(members.filter(m => m.id !== member_id))
  }}

  async function handleLikedFoodSearch() {
    const response = await fetch(`/api/foods/search?q=${likedFoodSearch}`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      setLikedFoodResults(data.slice(0, 10))
    }
  }

  async function handleDislikedFoodSearch() {
    const response = await fetch(`/api/foods/search?q=${dislikedFoodSearch}`, {
      method: 'GET',
      credentials: 'include'
    })
    if (response.ok) {
      const data = await response.json()
      setDislikedFoodResults(data.slice(0, 10))
    }
  }

  async function handleAddLikedFood(food) {
    const response = await fetch('/api/users/me/liked-foods/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ food_id: food.food_id })
    })
    if (response.ok) {
      setLikedFoodsList([...likedFoodsList, { food_id: food.food_id, name: food.name }])
    }
  }

  async function handleAddDislikedFood(food) {
    const response = await fetch('/api/users/me/disliked-foods/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ food_id: food.food_id })
    })
    if (response.ok) {
      setDislikedFoodsList([...dislikedFoodsList, { food_id: food.food_id, name: food.name }])
    }
  }

  async function handleRemoveLikedFood(food_id) {
    const response = await fetch(`/api/users/me/liked-foods/${food_id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      setLikedFoodsList(likedFoodsList.filter(f => f.food_id !== food_id))
    }
  }

  async function handleRemoveDislikedFood(food_id) {
    const response = await fetch(`/api/users/me/disliked-foods/${food_id}`, {
      method: 'DELETE',
      credentials: 'include'
    })
    if (response.ok) {
      setDislikedFoodsList(dislikedFoodsList.filter(f => f.food_id !== food_id))
    }
  }

  async function handlePasswordUpdate() {
    const response = await fetch('/api/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(passwordData)
    })
    if (response.ok) {
      setIsChangingPassword(false)
      setPasswordData({ current_password: "", new_password: "" })
    } else {
      setError("Echec de la mise à jour du mot de passe")
    }
  }

  const inputClass = "border border-line rounded-xl px-4 py-2 text-ink outline-none focus:border-green w-full"

  return (
    <div className="pb-20 lg:pb-6 px-4 lg:px-8 bg-cream min-h-screen">
      <div className="pt-6 max-w-2xl mx-auto">
        {isEditing ? (
          // mode édition
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-medium text-ink">Profil</h1>
              <button onClick={handleSave} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                Enregistrer
              </button>
            </div>

            {error && <p className="text-coral text-sm">{error}</p>}

            <div className="bg-white border border-line rounded-2xl p-4 flex flex-col gap-3">
              <input
                placeholder="Prénom"
                value={profile?.first_name || ""}
                onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
                className={inputClass}
              />
              <input
                placeholder="Email"
                value={profile?.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-sm font-medium text-muted mb-3">Informations personnelles</h3>
              <div className="flex flex-col gap-3">
                <input
                  type="date"
                  value={profile?.birth_date || ""}
                  onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={profile?.gender || ""}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Genre</option>
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                </select>
                <div className="flex flex-wrap gap-2">
                  {MEALS.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-ink border border-line rounded-full px-3 py-1">
                      <input
                        type="checkbox"
                        checked={profile?.meals?.includes(type) || false}
                        onChange={(e) => {
                          const current = profile?.meals || []
                          if (e.target.checked) {
                            setProfile({...profile, meals: [...current, type]})
                          } else {
                            setProfile({...profile, meals: current.filter(t => t !== type)})
                          }
                        }}
                        className="accent-green"
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-sm font-medium text-muted mb-3">Alimentation</h3>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-medium text-ink">Régime alimentaire</h4>
                <div className="flex flex-wrap gap-2">
                  {DIET_TYPES.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-ink border border-line rounded-full px-3 py-1">
                      <input
                        type="checkbox"
                        checked={profile?.diet_type?.includes(type) || false}
                        onChange={(e) => {
                          const current = profile?.diet_type || []
                          if (e.target.checked) {
                            setProfile({...profile, diet_type: [...current, type]})
                          } else {
                            setProfile({...profile, diet_type: current.filter(t => t !== type)})
                          }
                        }}
                        className="accent-green"
                      />
                      {type}
                    </label>
                  ))}
                </div>

                <h4 className="text-sm font-medium text-ink">Allergies et intolérances</h4>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_CONSTRAINTS.map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-ink border border-line rounded-full px-3 py-1">
                      <input
                        type="checkbox"
                        checked={profile?.dietary_constraints?.includes(type) || false}
                        onChange={(e) => {
                          const current = profile?.dietary_constraints || []
                          if (e.target.checked) {
                            setProfile({...profile, dietary_constraints: [...current, type]})
                          } else {
                            setProfile({...profile, dietary_constraints: current.filter(t => t !== type)})
                          }
                        }}
                        className="accent-green"
                      />
                      {type}
                    </label>
                  ))}
                </div>

                <h4 className="text-sm font-medium text-ink mt-2">Aliments préférés</h4>
                <div className="flex gap-2">
                  <input
                    placeholder="Rechercher un aliment"
                    value={likedFoodSearch}
                    onChange={(e) => setLikedFoodSearch(e.target.value)}
                    className={inputClass}
                  />
                  <button onClick={handleLikedFoodSearch} className="border border-line text-ink rounded-xl px-4 py-2 shrink-0">
                    Rechercher
                  </button>
                </div>
                {likedFoodResults.map((food) => (
                  <button key={food.food_id} onClick={() => handleAddLikedFood(food)} className="text-left text-sm text-green">
                    + {food.name}
                  </button>
                ))}
                <div className="flex flex-wrap gap-2">
                  {likedFoodsList.map((item) => (
                    <span key={item.food_id} className="flex items-center gap-2 bg-green-soft text-green-icon rounded-full px-3 py-1 text-sm">
                      {item.name}
                      <button onClick={() => handleRemoveLikedFood(item.food_id)}>✕</button>
                    </span>
                  ))}
                </div>

                <h4 className="text-sm font-medium text-ink mt-2">Aliments à éviter</h4>
                <div className="flex gap-2">
                  <input
                    placeholder="Rechercher un aliment"
                    value={dislikedFoodSearch}
                    onChange={(e) => setDislikedFoodSearch(e.target.value)}
                    className={inputClass}
                  />
                  <button onClick={handleDislikedFoodSearch} className="border border-line text-ink rounded-xl px-4 py-2 shrink-0">
                    Rechercher
                  </button>
                </div>
                {dislikedFoodResults.map((food) => (
                  <button key={food.food_id} onClick={() => handleAddDislikedFood(food)} className="text-left text-sm text-green">
                    + {food.name}
                  </button>
                ))}
                <div className="flex flex-wrap gap-2">
                  {dislikedFoodsList.map((item) => (
                    <span key={item.food_id} className="flex items-center gap-2 bg-coral-inactive/20 text-coral rounded-full px-3 py-1 text-sm">
                      {item.name}
                      <button onClick={() => handleRemoveDislikedFood(item.food_id)}>✕</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-sm font-medium text-muted mb-3">Membres du foyer</h3>
              <div className="flex flex-col gap-2">
                {members.map((member, index) => (
                  <div key={member.id} className="flex items-center gap-2">
                    <input
                      value={member.first_name}
                      onChange={(e) => {
                        const updatedMembers = [...members]
                        updatedMembers[index] = { ...member, first_name: e.target.value }
                        setMembers(updatedMembers)
                      }}
                      className={inputClass}
                    />
                    <button onClick={() => handleRemoveMember(member.id)} className="text-coral shrink-0">✕</button>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2 mt-3">
                <input
                  placeholder="Prénom du membre"
                  value={newMember.first_name}
                  onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
                  className={inputClass}
                />
                <select
                  value={newMember.gender}
                  onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
                  className={inputClass}
                >
                  <option value="">Genre</option>
                  <option value="Femme">Femme</option>
                  <option value="Homme">Homme</option>
                </select>
                <input
                  type="date"
                  value={newMember.date_of_birth}
                  onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
                  className={inputClass}
                />
                <button onClick={handleAddMember} className="border border-line text-ink rounded-full px-4 py-2">
                  Ajouter un membre
                </button>
              </div>
            </div>
          </div>
        ) : (
          // mode lecture
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-medium text-ink">Profil</h1>
              <button onClick={() => setIsEditing(true)} className="text-green font-medium">
                Modifier
              </button>
            </div>

            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-16 h-16 rounded-full bg-green flex items-center justify-center text-white text-xl font-medium">
                {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : "?"}
              </div>
              <p className="font-medium text-ink">{profile?.first_name}</p>
              <p className="text-sm text-muted">{profile?.email}</p>
            </div>

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-xs font-medium text-green uppercase mb-2">Informations personnelles</h3>
              <div className="flex flex-col">
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">Âge</span>
                  <span className="text-ink">{profile?.birth_date ? `${calculateAge(profile.birth_date)} ans` : "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">Genre</span>
                  <span className="text-ink">{profile?.gender || "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">Foyer</span>
                  <span className="text-ink">{profile?.household_size ? `${profile.household_size} personnes` : "Non renseigné"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted text-sm">Repas par jour</span>
                  <span className="text-ink">{profile?.meals?.length || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-xs font-medium text-green uppercase mb-2">Alimentation</h3>
              <div className="flex flex-col">
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">Régime</span>
                  <span className="text-ink">{profile?.diet_type?.join(", ") || "Aucun"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">Allergies</span>
                  <span className="text-ink text-right">{profile?.dietary_constraints?.join(", ") || "Aucune"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-line">
                  <span className="text-muted text-sm">J'aime</span>
                  <span className="text-ink text-right">{likedFoodsList.map(i => i.name).join(", ") || "Aucun"}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted text-sm">J'évite</span>
                  <span className="text-ink text-right">{dislikedFoodsList.map(i => i.name).join(", ") || "Aucun"}</span>
                </div>
              </div>
            </div>

            {members.length > 0 && (
              <div className="bg-white border border-line rounded-2xl p-4">
                <h3 className="text-xs font-medium text-muted uppercase mb-2">Membres du foyer</h3>
                <div className="flex flex-col">
                  {members.map((member, index) => (
                    <div key={member.id} className={`flex justify-between py-2 ${index < members.length - 1 ? "border-b border-line" : ""}`}>
                      <span className="text-muted text-sm">{member.first_name}</span>
                      <span className="text-ink">{member.gender} {member.birth_date ? `${calculateAge(member.birth_date)} ans` : "âge non renseigné"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-white border border-line rounded-2xl p-4">
              <h3 className="text-xs font-medium text-green uppercase mb-3">Sécurité</h3>

              {isChangingPassword ? (
                <div className="flex flex-col gap-2">
                  <input
                    type="password"
                    placeholder="Mot de passe actuel"
                    value={passwordData.current_password}
                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={passwordData.new_password}
                    onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                    className={inputClass}
                  />
                  <div className="flex gap-2">
                    <button onClick={handlePasswordUpdate} className="bg-green-pastel text-green-pastel-ink rounded-full px-4 py-2">
                      Confirmer
                    </button>
                    <button onClick={() => setIsChangingPassword(false)} className="border border-line text-ink rounded-full px-4 py-2">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setIsChangingPassword(true)} className="text-muted text-sm">
                  Modifier mon mot de passe
                </button>
              )}

              {error && <p className="text-coral text-sm mt-2">{error}</p>}

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-line">
                <button onClick={async () => {
                  const response = await fetch('/api/auth/logout', {
                    method: 'POST',
                    credentials: 'include'
                  })
                  if (response.ok) {
                    window.location.href = '/login'
                  }
                }} className="text-ink text-sm text-left">
                  Se déconnecter
                </button>
                <button onClick={async () => {
                  if (window.confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
                    const response = await fetch('/api/users/me', {
                      method: 'DELETE',
                      credentials: 'include'
                    })
                    if (response.ok) {
                      window.location.href = '/register'
                    }
                  }
                }} className="text-coral text-sm text-left">
                  Supprimer le compte
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile