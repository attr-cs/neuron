const {User} = require('../models/userModel');

const toggleFollow = async(req,res)=>{
    const { userId, targetId } = req.body;
    if(!userId || !targetId){
        return res.status(404).json({msg:"User not found!"})
    }
    try{
        const user = await User.findById(userId)
        const targetUser = await User.findById(targetId)

        const isFollowing = user.following.includes(targetId);
        if(isFollowing){
            // unfollow both
            user.following = user.following.filter(id=>id.toString()!==targetId);
            targetUser.followers = targetUser.followers.filter(id=>id.toString()!==userId);
        }else{
            // follow both
            user.following.push(targetId)
            targetUser.followers.push(userId)
        }
        await user.save()
        await targetUser.save()

        return res.status(200).json({msg:isFollowing?"Unfollowed":"Followed"})

    }catch(err){
        return res.status(500).json({msg:"Internal Server Problem", err:err})
    }
}

const checkFollowStatus = async (req,res)=>{
    const { userId, targetId} = req.body;

    try{
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({msg:"User not found"})
        }
        const isFollowing = user.following.includes(targetId);
        return res.json({isFollowing:isFollowing});
    }catch(err){
        return res.status(500).json({msg:"Internal Server Problem", err:err})
    }
}

module.exports = {toggleFollow, checkFollowStatus}