import { IconButton, Typography, Stack} from '@mui/material'
import { Comment, ThumbUpAlt, ThumbUpOffAlt, Bookmark, BookmarkOutlined, MoreVert, BookmarkAdded, BookmarkAdd, BookmarkBorder } from '@mui/icons-material'
import defaultImage from '../assets/default_profile_avatar.png';
import ButtonDark from './ButtonDark';
import { useState } from 'react';

function Post({ likes, comments, name, username, text, profileImageUrl, dateCreated, isEdited, views,postedImageUrl }) {

    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    return (<>
        <div className='border-2 rounded-md w-full px-5 pt-6 pb-2 mb-3'>
            <div className='flex justify-between'>
                <div className='flex flex-row gap-2'>
                    <img
                        referrerPolicy="no-referrer"
                        src={profileImageUrl || defaultImage}
                        alt="profile_image"
                        className='rounded-full border-2 border-slate-200 w-12 h-12 '
                    />
                    <div>
                        <h2 className='text-base font-semibold'>{name}</h2>
                        <p className='text-gray-700 text-sm'>{username}</p>
                    </div>
                </div>
                <div>
                    <ButtonDark>Follow</ButtonDark>
                </div>
            </div>

            <div className='mt-4 px-3 text-base'>
                {text}
                
                {postedImageUrl? (<>

                    <img src={postedImageUrl} className='w-full mt-3 rounded-md' alt="" />
                </>): null}
                <div className='w-full flex justify-between'>
                <p className="text-slate-600 mt-2 text-sm">{views} views</p>
                <p className="text-slate-600 mt-2 text-sm">{dateCreated}</p>
                </div>
            </div>

            <div className="mt-5">
                <div className='flex justify-between'>
                    <div className='flex gap-10'>

                        <div className='flex text-sm items-center'>
                            <IconButton onClick={()=>setIsLiked(!isLiked)}>
                                {isLiked ? <ThumbUpAlt color='primary' fontSize="small" /> : <ThumbUpOffAlt fontSize="small"/>}
                            </IconButton>
                            <p>{likes}</p>
                        </div>

                        <div className='flex text-sm items-center'>
                            <IconButton>
                                <Comment fontSize="small"/>
                            </IconButton>
                            <p>{comments}</p>
                        </div>

                        
                    </div>
                    <div className='flex gap-4'>
                        <div className='flex text-sm items-center'>
                            <IconButton onClick={()=>setIsSaved(!isSaved)}>
                                {isSaved ? <Bookmark color='warning' fontSize="small" /> : <BookmarkBorder fontSize="small"/>}
                            </IconButton>
                            <p className='w-10 '>{isSaved? "Saved!" : "Save"}</p>
                        </div>

                        <div className='flex text-sm items-center'>
                            <IconButton>
                                <MoreVert fontSize="small"/>
                            </IconButton>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    </>)
}

export default Post