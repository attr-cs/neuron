import { useRecoilState, useRecoilValue } from "recoil";
import { userState } from "../store/atoms";
import { useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import InputCustom from './EditProfileInput' 
import { Link } from "react-router-dom";
import { IconButton } from "@mui/material";
import { Button } from '@/components/ui/button';
import { LocationOn, Man, Notes, People } from "@mui/icons-material";
import { AccountCircle, CalendarMonth, Person } from "@mui/icons-material";

function EditProfile({ isEdited,setIsEdited }) {
    const [formData, setFormData] = useState({
        username: "",
        firstname: "",
        lastname: "",
        bio: "",
        location: "",
        birthdate: "",
        websiteUrl: "",
        gender: ""

    })

    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loggedInUser, setLoggedInUser] = useRecoilState(userState);
    const [usernameError, setUsernameError] = useState("");
    


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/signup`, formData);
            if (response.status == 200) {
                const { token, userId, username } = response.data;
            }
        } catch (err) {
            setError("Error: " + err);
        }
    }

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    }



    const usernameCheck = debounce(async (value) => {


        try {
            const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/user/check-username`, { username: value });
            if (response.data.exists) {
                setUsernameError("This Username is already taken!");
            }
            else {
                setUsernameError(null);
            }
        } catch (err) {
            console.log(err);
        }
    }, 300);
    useEffect(() => {
        if (formData.username) usernameCheck(formData.username);
    }, [formData.username, usernameCheck])


    return (<>
        <div className="w-full">
            <form onSubmit={handleSubmit}>
                
                
            

                <InputCustom
                    icon={<AccountCircle />}
                    type={"text"}
                    placeholder={"joseph56"}
                    name={"username"}
                    value={formData.username}
                    onChange={handleChange}
                />
                {usernameError ? <p className="w-full my-3 text-base text-red-600 text-center font-bold">{usernameError}</p> : null}

                <div className="flex gap-1">

                    <InputCustom
                        icon={<Person />}
                        type={"text"}
                        placeholder={"Joseph"}
                        name={"firstname"}
                        value={formData.firstname}
                        onChange={handleChange}
                    />

                    <InputCustom
                        icon={<Person />}
                        type={"text"}
                        placeholder={"Peterson"}
                        name={"lastname"}
                        value={formData.lastname}
                        onChange={handleChange}
                    />

                </div>



                <div className="w-full outline-none bg-white border-gray-300 border-2 text-black px-6 pl-3 py-2 rounded-md mb-2 flex gap-4">

                    <Notes />
                    <textarea
                        className="w-full outline-none"
                        type={"text"}
                        placeholder={"I like to program and surf on the web..."}
                        name={"bio"}
                        value={formData.bio}
                        onChange={handleChange}
                        rows={2}
                    ></textarea>

                </div>

                <div className="flex gap-1">




                    <InputCustom
                        icon={<CalendarMonth />}
                        type={"date"}
                        // placeholder={"Peterson"} 
                        name={"birthdate"}
                        value={formData.birthdate || "1947-08-15"}
                        onChange={handleChange}
                    />




                    <div className="w-full outline-none bg-white border-gray-300 border-2 text-black px-6 pl-3 py-2 rounded-md mb-2 flex gap-4">

                        <Man />
                        <select
                            className="w-full"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                        >
                            <option value="Male"> Male</option>
                            <option value="Female"> Female</option>
                            <option value="Other"><People /> Other</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                        </select>

                    </div>

                </div>


                <InputCustom
                    icon={<LocationOn />}
                    type="text"
                    placeholder="New York, USA"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                />

                <InputCustom
                    icon={<Link />}
                    type="text"
                    placeholder="https://www.domain.com/portfolio"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                />
                
                <div className="flex gap-1">

                    <button onClick={()=>setIsEdited(!isEdited)} className="bg-black rounded-md mb-5 text-white w-full text-center font-bold py-2 " type="submit">Cancel</button>
                    <button className="bg-black rounded-md mb-5 text-white w-full text-center font-bold py-2 " type="submit">Update</button>
                </div>
                
                {error && <p className="w-full my-3 text-base text-red-600 text-center font-bold">{error}</p>}
            </form>
        </div>
    </>)
}


export default EditProfile