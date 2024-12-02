import { useRecoilValue, useSetRecoilState } from "recoil";
import { authState, userBasicInfoState, userProfileState } from "../store/atoms";
import { useEffect, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import InputCustom from './EditProfileInput';
import { Link } from "react-router-dom";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { 
  LocationOn, 
  Man, 
  Notes, 
  People, 
  AccountCircle, 
  CalendarMonth, 
  Person,
  Link as LinkIcon
} from "@mui/icons-material";

function EditProfile({ isEdited, setIsEdited }) {
  const auth = useRecoilValue(authState);
  const basicInfo = useRecoilValue(userBasicInfoState);
  const profile = useRecoilValue(userProfileState);
  const setBasicInfo = useSetRecoilState(userBasicInfoState);
  const setProfile = useSetRecoilState(userProfileState);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [usernameError, setUsernameError] = useState("");

  const [formData, setFormData] = useState({
    username: basicInfo.username || "",
    firstname: basicInfo.firstname || "",
    lastname: basicInfo.lastname || "",
    bio: profile.bio || "",
    location: profile.location || "",
    birthdate: profile.birthdate || "",
    websiteUrl: profile.websiteUrl || "",
    gender: profile.gender || ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/user/update-profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        // Update local state
        setBasicInfo(prev => ({
          ...prev,
          username: formData.username,
          firstname: formData.firstname,
          lastname: formData.lastname
        }));

        setProfile(prev => ({
          ...prev,
          bio: formData.bio,
          location: formData.location,
          birthdate: formData.birthdate,
          websiteUrl: formData.websiteUrl,
          gender: formData.gender
        }));

        setIsEdited(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const usernameCheck = debounce(async (value) => {
    if (value === basicInfo.username) {
      setUsernameError("");
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/check-username`,
        { username: value },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`
          }
        }
      );
      
      setUsernameError(response.data.exists ? "Username already taken" : "");
    } catch (err) {
      console.error("Username check failed:", err);
    }
  }, 300);

  useEffect(() => {
    if (formData.username) usernameCheck(formData.username);
  }, [formData.username]);

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputCustom
          icon={<AccountCircle />}
          type="text"
          placeholder="Username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={isSubmitting}
          error={usernameError}
        />

        <div className="flex gap-2">
          <InputCustom
            icon={<Person />}
            type="text"
            placeholder="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <InputCustom
            icon={<Person />}
            type="text"
            placeholder="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="relative">
          <Notes className="absolute left-3 top-3 text-gray-400" />
          <textarea
            className="w-full min-h-[100px] pl-10 pr-4 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 outline-none resize-none"
            placeholder="Bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2">
          <InputCustom
            icon={<CalendarMonth />}
            type="date"
            name="birthdate"
            value={formData.birthdate}
            onChange={handleChange}
            disabled={isSubmitting}
          />

          <div className="relative flex-1">
            <Man className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              className="w-full pl-10 pr-4 py-2 rounded-md border-2 border-gray-300 focus:border-blue-500 outline-none"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              disabled={isSubmitting}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
        </div>

        <InputCustom
          icon={<LocationOn />}
          type="text"
          placeholder="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        <InputCustom
          icon={<LinkIcon />}
          type="url"
          placeholder="Website URL"
          name="websiteUrl"
          value={formData.websiteUrl}
          onChange={handleChange}
          disabled={isSubmitting}
        />

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsEdited(false)}
            disabled={isSubmitting}
            className="w-full"
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || !!usernameError}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default EditProfile;