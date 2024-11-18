import Post from '../components/Post';
import defaultImage from '../assets/default_profile_avatar.png';
import samplePostImage from '../assets/neural_network_actual.png';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image } from 'lucide-react';

function ProfilePosts({userData}) {

    return (<>
        <div className="w-full flex flex-col gap-3 py-7 text-lg my-5">
                <h2 className='self-start ml-2'>Posts</h2>
            
                <Tabs defaultValue='all' className='w-full'>

                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger  value="all">All</TabsTrigger>
                        <TabsTrigger  value="text"><FileText className="w-4 h-4 mr-2"/>Text</TabsTrigger>
                        <TabsTrigger  value="image"><Image className="w-4 h-4 mr-2"/>Image</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all">
                    <Post likes={"23"} comments={"42"} name={userData?.firstname + " " + userData.lastname} username={userData.username}
                    text={"Today i got my first certificate!"}
                    profileImageUrl={userData.profileImageUrl || defaultImage}
                    postedImageUrl={""}
                    dateCreated={"23/4/2024"}
                    isEdited={false}
                    views={"234"}
                />
                    <Post likes={"23"} comments={"42"} name={userData?.firstname + " " + userData.lastname} username={userData.username}
                    text={"Today i got my first certificate!"}
                    profileImageUrl={userData.profileImageUrl || defaultImage}
                    postedImageUrl={samplePostImage}
                    dateCreated={"23/4/2024"}
                    isEdited={false}
                    views={"234"}
                />
                    </TabsContent>
                    <TabsContent value="text">
                    <Post likes={"23"} comments={"42"} name={userData?.firstname + " " + userData.lastname} username={userData.username}
                    text={"Today i got my first certificate!"}
                    profileImageUrl={userData.profileImageUrl || defaultImage}
                    postedImageUrl={""}
                    dateCreated={"23/4/2024"}
                    isEdited={false}
                    views={"234"}
                />
                    </TabsContent>
                    <TabsContent value="image">
                    <Post likes={"23"} comments={"42"} name={userData?.firstname + " " + userData.lastname} username={userData.username}
                    text={"Today i got my first certificate!"}
                    profileImageUrl={userData.profileImageUrl || defaultImage}
                    postedImageUrl={samplePostImage}
                    dateCreated={"23/4/2024"}
                    isEdited={false}
                    views={"234"}
                />
                    </TabsContent>

                </Tabs>
                
                
                
                
                

            
        </div>
    </>)
}
export default ProfilePosts