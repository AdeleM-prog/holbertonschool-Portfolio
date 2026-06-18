import { useState, useEffect} from "react"

function Profile() {
    //
    const [profile, setProfile] = useState(null)
    setProfile(data)
    useEffect(() => {
    async function checkAuth() {
    const response = await fetch('http://localhost:8000/users/me', {
      method: 'GET',
      credentials: 'include'- //sending cookie in the request
    })
    }},
    checkAuth(),
    [])



    return (
        <div>
            <h1>Profile</h1>
        </div>
  )
}

export default Profile