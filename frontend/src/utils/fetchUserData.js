import axios from "axios";

async function fetchUserData(username, token){
    
    try{
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/user/userdetails/${username}`,{
            headers:{
                Authorization: `Bearer ${token}`
            },
        });
        // {
        //     user: {
        //         bio: "",
        //         createdAt: "2024-10-30T13:51:09.301Z",
        //         firstname: "Irish",
        //         lastname: "Walls",
        //         password: "irish234",
        //         profilePic: "",
        //         username: "irishwalls@gmail.com",
        //         __v: 0,
        //         _id: "672239cdac24aaade8b71082
        //     }
        // }
        return response.data?.user;
    }catch(err){
        console.error("Failed to fetch user data: "+err);
        return null;
    }
}

export default fetchUserData