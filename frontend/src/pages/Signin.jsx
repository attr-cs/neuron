import axios from "axios";
import { useState } from "react"
import { authState, userState } from "../store/atoms";
import { useRecoilState } from "recoil";
import fetchUserData from "../utils/fetchUserData";
import { useNavigate, Link } from "react-router-dom";

import {GoogleLogin} from '@react-oauth/google'
import {jwtDecode} from 'jwt-decode'
import {Visibility, VisibilityOff} from "@mui/icons-material"
import { Divider, IconButton, Paper } from "@mui/material";


function Signin(){

    const navigate = useNavigate();
    const [,setAuth] = useRecoilState(authState);
    const [,setUser] = useRecoilState(userState);
    const [showPassword, setShowPassword] = useState(false);
    
    const [formData, setFormData] = useState({
        username:"",
        password:""
    })
    const [error,setError] = useState("");

    function handleChange(e){
        const {name, value} = e.target;
        setFormData({...formData,[name]:value})
    }

    function togglePasswordVisibility(){
        setShowPassword(!showPassword);
    }

    const handleSubmit = async(e)=>{
        e.preventDefault();
        try{
            
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signin`,formData);
            
            if(response.status==200){
                const { token, userId, username } = response.data;

                setAuth({isAuthenticated: true, token:token, userId:userId, username: username})
                localStorage.setItem("token",token);
                localStorage.setItem("userId",userId);
                localStorage.setItem("username",username);

                const userData = await fetchUserData(username, token);
                setUser({user:userData});

                navigate("/dashboard");
            }

        }catch(err){
            
            setError("Error: " + err);
        }

    }

    const onSignInSuccess = async (tokenResponse) => {
        const {email, given_name, family_name, picture} = jwtDecode(JSON.stringify(tokenResponse));

        const user = {
            email: email,
            firstname: given_name,
            lastname: family_name,
            profileImageUrl: picture
        }
        
        try{
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/google-auth`, user);
        
            const { token, userId, username } = response.data;
            setAuth({ isAuthenticated: true, token: token, userId: userId, username: username });
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            localStorage.setItem("username", username);
            navigate('/dashboard');

            const userData = await fetchUserData(username, token);
            setUser({ user: userData });
            
        
        }catch(err){
            console.log(err);
        }
        
    };
    

    return (<>
        
        <div className="w-full flex justify-center pt-12">
            <Paper className="px-10 py-8  text-center">

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center gap-3 mb-6 justify-center">
                    <h1 className="text-3xl">Log In</h1>
                    <h2 className="text-slate-500 text-base">Enter the credentials to login to your account.</h2>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <input 
                            type="text" 
                            placeholder="Username/Email"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full outline-none bg-white border-gray-300 border-2 text-black px-3 pl-6 py-2 rounded-md mb-2"
                            required
                        />


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


                        <button className="bg-black rounded-md text-white w-full text-center font-bold py-2 " type="submit">Log In</button>
                        <Link to="//request-reset" className="my-1 text-sm">Forgot Password?</Link>
                        {error && <p className="w-full my-3 text-base text-red-600 text-center font-bold">{error}</p>}
                    </div>
                    
                </form>
                <Divider sx={{marginBottom:"10px",marginTop:"10px"}}><h1 className="text-gray-500">OR CONTINUE WITH</h1></Divider>
            <div className="flex justify-center w-full">
            
              <GoogleLogin
                onSuccess={onSignInSuccess}
                onError={(err) => console.log("Failed Signup: ", err)}
                size="large"
              />
            
            </div>
                <p className="text-slate-500 mt-6 text-base">Not Registered yet? 
                    <Link to="/signup" className="border-2 border-slate-500 rounded-md text-sm px-5 ml-3 mb-5  w-full text-center  py-1">Register Now</Link> 
                </p>

            </Paper>
         </div>   
    </>)
} 

export default Signin