import { useEffect, useState } from "react"
import axios from 'axios'
import defaultImage from '../assets/default_profile_avatar.png'
import {authState} from '../store/atoms'
import { useRecoilValue } from "recoil"
import { useNavigate } from "react-router-dom"

function UsersPage(){
    const navigate = useNavigate();
    const auth = useRecoilValue(authState);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(()=>{
        const fetchUsers = async()=>{
            try{
                const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userslist`);
                if(response.status==200){
                        const usersList = response.data.users.filter(user=>user._id != auth.userId);
                        console.log(usersList)
                        setUsers(usersList);            
                }
            }catch(err){
                console.log("Failed to fetch users! : ",err )
            }
            setLoading(false)
        }
        fetchUsers();
    },[auth.userId]);

    if(loading)return (<h2>loading users..</h2>)
    return (<>
        <div>
            <div>
                <h1>Users</h1>
            </div>
            <div>
                {users.map(user=>{
                    return (
                        <div key={user._id} onClick={()=>navigate(`/profile/${user.username}`)}>
                            <img referrerPolicy="no-referrer" src={user.profileImageUrl || defaultImage} style={{width:"50px"}} alt="profile_image" />
                            <h3>{user.firstname} {user.lastname}</h3>
                            <h3>{user.username}</h3>
                            <h3>{user.email}</h3>
                            <p>{user.createdAt}</p>
                            <hr />
                        </div>
                    )
                })}
            </div>
        </div>
    </>)
}

export default UsersPage