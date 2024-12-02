import { motion } from "framer-motion";
import { CalendarMonth, Event, Link, LocationOn, Man, Notes } from "@mui/icons-material";

function ProfileInfo({ bio, location, birthdate, gender, dateJoined, siteLink, userData }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex flex-col gap-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col mb-7 gap-2">
        <div className="flex items-center text-lg font-semibold">
          <Notes className="mr-2" /> Bio
        </div>
        <p className="text-gray-700">
          {bio || "Lorem ipsum dolor sit, amet consectetur adipisicing elit. Assumenda culpa, iste totam repudiandae soluta ratione ad sunt nemo molestias nam quis, pariatur nesciunt."}
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="grid sm:grid-cols-2 grid-cols-1 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <Event className="mr-2" /> 
            <span className="font-semibold">Date Joined:</span>
            <span className="ml-2">{new Date(userData.dateJoined).toLocaleDateString() || "15/08/1947"}</span>
          </div>
          <div className="flex items-center">
            <LocationOn className="mr-2" /> 
            <span className="font-semibold">Location:</span>
            <span className="ml-2">{location || "51 Main St, Anytown, India 108"}</span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center">
            <Man className="mr-2" /> 
            <span className="font-semibold">Gender:</span>
            <span className="ml-2">{gender || "Male"}</span>
          </div>
          <div className="flex items-center">
            <Link className="mr-2" /> 
            <span className="font-semibold">Personal Website:</span>
            <a href={siteLink || "https://www.google.com"} className="ml-2 hover:underline text-blue-600">
              {siteLink || "https://www.google.com"}
            </a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ProfileInfo;