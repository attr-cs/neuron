import { useEffect, useState } from "react"
import {authState, userState} from "../store/atoms/index"
import axios from 'axios'
import debounce from 'lodash.debounce'
import { useRecoilState, useSetRecoilState } from "recoil"
import {useNavigate, Link} from 'react-router-dom'
import fetchUserData from "../utils/fetchUserData"
import {jwtDecode} from 'jwt-decode'
import {Visibility, VisibilityOff} from "@mui/icons-material"
import {Box, Divider, IconButton} from "@mui/material"
import NeuralNetwork from "../assets/neural_network_actual.png"


import {GoogleLogin} from '@react-oauth/google'

function Signup(){
    const navigate = useNavigate();

    const setUser = useSetRecoilState(userState);
    const [formData, setFormData] = useState({
        email: "",
        firstname:"",
        lastname:"",
        username:"",
        password:""
    })
    const [, setAuth] = useRecoilState(authState)
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [usernameError, setUsernameError] = useState("");

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signup`,formData);
            if(response.status == 200){
                const {token, userId, username} = response.data;
            
                setAuth({isAuthenticated:true,token:token,userId:userId, username: username})

                localStorage.setItem("token",token);
                localStorage.setItem("userId",userId);
                localStorage.setItem("username",username);

                const userData = await fetchUserData(username, token);
                setUser({user:userData});
                navigate('/dashboard');
            }
        }catch(err){  
            setError("Error: " + err);
        }
    }

    function handleChange(e){
        const {name, value} = e.target;
        setFormData({...formData,[name]:value});
    }



    const usernameCheck = debounce(async (value)=>{
        
        
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/check-username`,{username:value});
            if(response.data.exists){
                setUsernameError("This Username is already taken!");
            }
            else{
                setUsernameError(null);        
            }
        }catch(err){
            console.log(err);
        }
    }, 300);
    useEffect(()=>{
        if(formData.username) usernameCheck(formData.username);
    }, [formData.username, usernameCheck])

    function togglePasswordVisibility(){
        setShowPassword(!showPassword);
    }
    
    const onSignUpSuccess = async (tokenResponse) => {
        const decoded = jwtDecode(JSON.stringify(tokenResponse));
        const { email, given_name, family_name, picture } = decoded;
    
        const user = {
            email: email,
            firstname: given_name,
            lastname: family_name,
            profileImageUrl: picture
        };
    
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/google-auth`, user);
            
                const { token, userId, username } = response.data;
    
                
                setAuth({ isAuthenticated: true, token: token, userId: userId, username: username });
                localStorage.setItem("token", token);
                localStorage.setItem("userId", userId);
                localStorage.setItem("username", username);
    
                
                navigate('/dashboard');
    
                
                const userData = await fetchUserData(username, token);
                setUser({ user: userData });
            
        } catch (err) {
            console.log(err);
        }
    };
    
    
    return (<>

<Box display="flex" height="100vh">

<Box flex="1"
    sx={{
        backgroundImage: `url(${NeuralNetwork})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position:'relative',
        '&::before':{
            content:'""',
            position:'absolute',
            top:0,
            left:0,
            right:0,
            bottom:0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex:1
        }
    }}>
    <div className="flex relative top-96 left-7 z-10 flex-col text-white font-bold">
        <h1 className="text-4xl">Just One More <span className="text-teal-400">N</span>euron!</h1>
        <p className="text-lg ">Join For Connections Like Nowhere Else.</p>
    </div>
</Box>

<Box flex="1">
        <div className="w-full h-full flex flex-col gap-8 pt-10 px-20">

            <div className="flex justify-end">
                    <Link to="/signin" className="rounded-full font-bold bg-black text-white px-6 py-2 ">
                    LogIn
                    </Link>
            </div>

            <div>
                
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center gap-1 mb-6 justify-center">
                    <h1 className="text-3xl">Create an account</h1>
                    <h2 className="text-slate-500 text-base">Enter the credentials to create an account.</h2>
                </div>
                <div>
                    
                    <input
                        className="w-full outline-none bg-white border-gray-300 border-2 text-black px-3 pl-6 py-2 rounded-md mb-2"
                        type="text" 
                        placeholder="Joseph"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        required
                    />

                    
                    <input 
                        className="w-full outline-none bg-white border-gray-300 border-2 text-black px-3 pl-6 py-2 rounded-md mb-2"
                        type="text" 
                        placeholder="Peterson" 
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        required
                    />

                    
                    <input 
                        className="w-full outline-none bg-white border-gray-300 border-2 text-black px-3 pl-6 py-2 rounded-md mb-2"
                        type="email" 
                        placeholder="josephpeter@gmail.com" 
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input 
                        className="w-full outline-none bg-white border-gray-300 border-2 text-black px-3 pl-6 py-2 rounded-md mb-2"
                        type="text" 
                        placeholder="joseph56" 
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    {usernameError? <p className="w-full my-3 text-base text-red-600 text-center font-bold">{usernameError}</p> : null}

                
                    
                    <div className="relative h-16">
                        <input 
                        className="w-full outline-none z-20 bg-white border-gray-300 border-2 text-black px-5 pl-12 py-2 rounded-md mb-2"
                            type={showPassword? "text": "password"} 
                            placeholder="***********" 
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <div className="flex  z-2 w-10 -translate-y-12 translate-x-2  justify-end">
                        <IconButton onClick={togglePasswordVisibility}>{showPassword?<Visibility/>:<VisibilityOff/>}</IconButton>

                        </div>
                    </div>

                </div>
                <button className="bg-black rounded-md mb-5 text-white w-full text-center font-bold py-2 " type="submit">Sign Up</button>
                {error && <p className="w-full my-3 text-base text-red-600 text-center font-bold">{error}</p>}
            </form>
            <Divider sx={{marginBottom:"20px"}}><h1 className="text-gray-500">OR CONTINUE WITH</h1></Divider>
            <div className="flex justify-center w-full">
            
              <GoogleLogin
                onSuccess={onSignUpSuccess}
                onError={(err) => console.log("Failed Signup: ", err)}
                size="large"
              />
            


            </div>
            
            </div>
        </div>
</Box>
</Box>


        
    </>)
}

export default Signup