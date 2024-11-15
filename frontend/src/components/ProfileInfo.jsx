import { CalendarMonth, Event, Link, LocationOn, Man, Notes } from "@mui/icons-material"


function ProfileInfo({ bio, location, birthdate, gender, dateJoined, siteLink, userData }) {

    return (<>
        <div className='flex flex-col mb-7 gap-0 sm:pr-32 pr-0'>
            <div>
                <Notes /> Bio
            </div>
            <div>
                {bio || "ya its Lorem ipsum dolor sit, amet consectetur adipisicing elit. Assumenda culpa, iste totam repudiandae soluta ratione ad sunt nemo molestias nam quis, pariatur nesciunt."}
            </div>
        </div>


        <div className="grid sm:grid-cols-2 grid-cols-1 ">
            <div>
                
            <div className='flex flex-row gap-5'>
                    <div>
                        <Event className="mr-2"/> Date Joined
                    </div>
                    <div className="font-semibold">
                        {new Date(userData.dateJoined).toLocaleDateString() || "15/08/1947"}
                    </div>
                </div>
                
                <div className='flex flex-col gap-1 my-4'>
                    <div>
                        <LocationOn className="mr-2" /> Location
                    </div>
                    <div className="font-semibold">
                        <span className="ml-9">{location || "51 Main St, Anytown, India 108"}</span>
                    </div>
                </div>


            </div>
            <div>
            <div>
                    <div className='flex flex-row gap-5'>
                        <div>
                            <Man className="mr-2" /> Gender
                        </div>
                        <div className="font-semibold">
                            {gender || "Male"}
                        </div>
                    </div>
                </div>

                
                <div className='flex flex-col gap-1 mt-4'>
                    <div>
                        <Link className="mr-2" /> Personal Website
                    </div>
                    <div className="font-semibold">
                        <a href={siteLink || "https://www.google.com"} className="ml-9 hover:underline text-blue-600">{siteLink || "https://www.google.com"}</a>
                    </div>
                </div>
            </div>
        </div>
        <div>
        </div>
    </>)
}

export default ProfileInfo