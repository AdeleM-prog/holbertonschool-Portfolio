import { useState, useEffect } from "react"

function Profile() {
  const [profile, setProfile] = useState(null)
  const [members, setMembers] = useState([])
  const [newMember, setNewMember] = useState({ first_name: "", gender: "", date_of_birth: "" })
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('/api/users/me', {
        method: 'GET',
        credentials: 'include'
      })
      const data = await response.json()
      if (response.ok) {
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
    const response = await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(profile)
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
      credentials: 'include', // envoie le token
      body: JSON.stringify(newMember)
    })
    if (response.ok) {
      const data = await response.json()
      setMembers([...members, { ...newMember, id: data.member_id }])
      setNewMember({ first_name: "", gender: "", date_of_birth: "" })
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
            <input
              placeholder="Genre"
              value={profile?.gender || ""}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
            />
            <input
              placeholder="Repas"
              value={profile?.meals || ""}
              onChange={(e) => setProfile({ ...profile, meals: e.target.value })}
            />
          </div>
          <h3>Alimentation</h3>
          <div>
            <input
              placeholder="Régime alimentaire"
              value={profile?.diet_type || ""}
              onChange={(e) => setProfile({ ...profile, diet_type: e.target.value })}
            />
            <input
              placeholder="Contraintes alimentaires"
              value={profile?.dietary_constraints || ""}
              onChange={(e) => setProfile({ ...profile, dietary_constraints: e.target.value })}
            />
            <input
              placeholder="Aliments préférés"
              value={profile?.liked_foods || ""}
              onChange={(e) => setProfile({ ...profile, liked_foods: e.target.value })}
            />
            <input
              placeholder="Aliments à éviter"
              value={profile?.disliked_foods || ""}
              onChange={(e) => setProfile({ ...profile, disliked_foods: e.target.value })}
            />
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
            </div>
          ))}
          <div>
            <input
              placeholder="Prénom du membre"
              value={newMember.first_name}
              onChange={(e) => setNewMember({ ...newMember, first_name: e.target.value })}
            />
            <input
              placeholder="Genre"
              value={newMember.gender}
              onChange={(e) => setNewMember({ ...newMember, gender: e.target.value })}
            />
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
            <p>{profile?.diet_type}</p>
            <p>{profile?.dietary_constraints}</p>
            <p>{profile?.liked_foods}</p>
            <p>{profile?.disliked_foods}</p>
          </div>
          <h3>Membres du foyer</h3>
          {members.map((member) => (
            <div key={member.id}>
              <p>{member.first_name} {member.gender} {member.birth_date ? calculateAge(member.birth_date) + " ans" : "âge non renseigné"}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile