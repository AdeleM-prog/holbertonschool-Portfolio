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
    async function fetchData() {
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

      const responseMembers = await fetch('/api/users/me/household-members', {
        method: 'GET',
        credentials: 'include'
      })
      const dataMembers = await responseMembers.json()
      if (responseMembers.ok) {
        setMembers(dataMembers)
      } else {
        setError("Membres du foyer non accessibles")
      }

      const responseLiked = await fetch('/api/users/me/liked-foods/', {
        method: 'GET',
        credentials: 'include'
      })
      const dataLiked = await responseLiked.json()
      if (responseLiked.ok) {
        setLikedFoodsList(dataLiked)
      }

      const responseDisliked = await fetch('/api/users/me/disliked-foods/', {
        method: 'GET',
        credentials: 'include'
      })
      const dataDisliked = await responseDisliked.json()
      if (responseDisliked.ok) {
        setDislikedFoodsList(dataDisliked)
      }
    }
    fetchData()
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
    console.log("profile avant envoi:", profile)
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

  return (
    <div>
      {isEditing ? (
        // mode édition
        <div>
          <button onClick={handleSave}>Enregistrer</button>
          <h1>Profil</h1>
          <div>
            <input
              placeholder="Prénom"
              value={profile?.first_name || ""}
              onChange={(e) => setProfile({ ...profile, first_name: e.target.value })}
            />
            <input
              placeholder="Email"
              value={profile?.email || ""}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </div>
          <h3>Informations personnelles</h3>
          <div>
            <input
              type="date"
              value={profile?.birth_date || ""}
              onChange={(e) => setProfile({ ...profile, birth_date: e.target.value })}
            />
            <select
              value={profile?.gender || ""}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            >
              <option value="">Genre</option>
              <option value="Femme">Femme</option>
              <option value="Homme">Homme</option>
            </select>
            <div>
              {MEALS.map((type) => (
                <label key={type}>
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
                  />
                  {type}
                </label>
              ))}
            </div>
          </div>
          <h3>Alimentation</h3>
          <div>
            <div>
              {DIET_TYPES.map((type) => (
                <label key={type}>
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
                  />
                  {type}
                </label>
              ))}
            </div>
            <div>
              {DIETARY_CONSTRAINTS.map((type) => (
                <label key={type}>
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
                  />
                  {type}
                </label>
              ))}
            </div>
            <h3>Aliments préférés</h3>
            <div>
              <input
                placeholder="Rechercher un aliment"
                value={likedFoodSearch}
                onChange={(e) => setLikedFoodSearch(e.target.value)}
              />
              <button onClick={handleLikedFoodSearch}>Rechercher</button>
              {likedFoodResults.map((food) => (
                <div key={food.food_id}>
                  <button onClick={() => handleAddLikedFood(food)}>
                    {food.name}
                  </button>
                </div>
              ))}
              <div>
                {likedFoodsList.map((item) => (
                  <p key={item.food_id}>
                    {item.name}
                    <button onClick={() => handleRemoveLikedFood(item.food_id)}>✕</button>
                  </p>
                ))}
              </div>
            </div>
            <h3>Aliments à éviter</h3>
            <div>
              <input
                placeholder="Rechercher un aliment"
                value={dislikedFoodSearch}
                onChange={(e) => setDislikedFoodSearch(e.target.value)}
              />
              <button onClick={handleDislikedFoodSearch}>Rechercher</button>
              {dislikedFoodResults.map((food) => (
                <div key={food.food_id}>
                  <button onClick={() => handleAddDislikedFood(food)}>
                    {food.name}
                  </button>
                </div>
              ))}
              <div>
                {dislikedFoodsList.map((item) => (
                  <p key={item.food_id}>
                    {item.name}
                    <button onClick={() => handleRemoveDislikedFood(item.food_id)}>✕</button>
                  </p>
                ))}
              </div>
            </div>
          </div>
          <h3>Membres du foyer</h3>
          {members.map((member, index) => (
            <div key={member.id}>
              <input
                value={member.first_name}
                onChange={(e) => {
                  const updatedMembers = [...members]
                  updatedMembers[index] = { ...member, first_name: e.target.value }
                  setMembers(updatedMembers)
                }}
              />
              <button onClick={() => handleRemoveMember(member.id)}>✕</button>
            </div>
          ))}
          <div>
            <input
              placeholder="Prénom du membre"
              value={newMember.first_name}
              onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
            />
            <select
              value={newMember.gender}
              onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
            >
              <option value="">Genre</option>
              <option value="Femme">Femme</option>
              <option value="Homme">Homme</option>
            </select>
            <input
              type="date"
              value={newMember.date_of_birth}
              onChange={(e) => setNewMember({ ...newMember, date_of_birth: e.target.value })}
            />
            <button onClick={handleAddMember}>Ajouter un membre</button>
          </div>
        </div>
      ) : (
        // mode lecture
        <div>
          <button onClick={() => setIsEditing(true)}>Modifier</button>
          <h1>Profil</h1>
          <div>
            <p>{profile?.first_name}</p>
            <p>{profile?.email}</p>
          </div>
          <h3>Informations personnelles</h3>
          <div>
            <p>{profile?.birth_date ? calculateAge(profile.birth_date) : "Non renseigné"}</p>
            <p>{profile?.gender}</p>
            <p>{profile?.household_size}</p>
            <p>{profile?.meals}</p>
          </div>
          <h3>Alimentation</h3>
          <div>
            <p>{profile?.diet_type?.join(", ")}</p>
            <p>{profile?.dietary_constraints}</p>
            <div>
              {likedFoodsList.map((item) => (
                <p key={item.food_id}>{item.name}</p>
              ))}
            </div>
            <div>
              {dislikedFoodsList.map((item) => (
                <p key={item.food_id}>{item.name}</p>
              ))}
            </div>
          </div>
          <h3>Membres du foyer</h3>
          {members.map((member) => (
            <div key={member.id}>
              <p>{member.first_name} {member.gender} {member.birth_date ? calculateAge(member.birth_date) + " ans" : "âge non renseigné"}</p>
            </div>
          ))}
          <h3>Mon compte</h3>
          {isChangingPassword ? (
            <div>
              <input
                type="password"
                placeholder="Mot de passe actuel"
                value={passwordData.current_password}
                onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
              />
              <input
                type="password"
                placeholder="Nouveau mot de passe"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
              />
              <button onClick={handlePasswordUpdate}>Confirmer</button>
              <button onClick={() => setIsChangingPassword(false)}>Annuler</button>
            </div>
          ) : (
            <button onClick={() => setIsChangingPassword(true)}>Modifier le mot de passe</button>
          )} <br></br>
          <button onClick={async () => {
            const response = await fetch('/api/auth/logout', {
              method: 'POST',
              credentials: 'include'
            })
            if (response.ok) {
              window.location.href = '/login'
            }
          }}>
            Se déconnecter
          </button> <br></br>
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
          }}>
            Supprimer le compte
          </button>
        </div>
      )}
    </div>
  )
}

export default Profile