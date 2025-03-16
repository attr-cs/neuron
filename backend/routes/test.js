// const express = require("express");
// const mongoose = require("mongoose");
// const readline = require("readline");
// const { Post } = require("../models/postModel");
// const axios = require("axios");

// const router = express.Router();
// const IMGBB_API_KEY = "481b5da3b30261c806c57b54707faa1b";

// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout
// });

// // Upload to ImgBB
// const uploadToImgBB = async (imageUrl) => {
//     if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
//         console.error("❌ Invalid image URL:", imageUrl);
//         return null;
//     }
//     try {
//         console.log("📤 Uploading Image:", imageUrl);
//         const response = await axios.post("https://api.imgbb.com/1/upload", null, {
//             params: {
//                 key: IMGBB_API_KEY,
//                 image: imageUrl,
//             },
//         });
//         if (response.data.success) {
//             console.log("✅ Image successfully uploaded to ImgBB:", response.data.data.display_url);
//             return response.data.data;
//         }
//         return null;
//     } catch (error) {
//         console.error("❌ Error uploading to ImgBB:", error.response?.data || error.message);
//         return null;
//     }
// };

// // Function to update a specific post by ID
// const updatePostById = async (postId) => {
//     try {
//         // Use .lean() to get raw document, bypassing schema filtering
//         const post = await Post.findById(postId).lean();
//         if (!post) {
//             console.log("❌ Post not found with ID:", postId);
//             return;
//         }

//         console.log("➡️ Found post:", post);

//         // Check if imageUrl exists and is a valid string
//         if (post.imageUrl && typeof post.imageUrl === "string" && post.imageUrl.trim() !== "") {
//             console.log("📸 Found image URL:", post.imageUrl);
//             const uploadedImage = await uploadToImgBB(post.imageUrl);

//             if (uploadedImage) {
//                 // Update the post directly in the database
//                 await Post.updateOne(
//                     { _id: post._id },
//                     {
//                         $push: { images: {
//                             imageId: uploadedImage.id,
//                             url: uploadedImage.url,
//                             thumbUrl: uploadedImage.thumb?.url || "",
//                             displayUrl: uploadedImage.display_url,
//                         }},
//                         $unset: { imageUrl: "" }
//                     }
//                 );
//                 console.log(`✅ Successfully updated post: ${post._id}`);
//             } else {
//                 console.log("❌ Failed to upload image for post:", post._id);
//             }
//         } else {
//             console.log("⚠️ No valid imageUrl found for this post, skipping upload.");
//             // Ensure images array exists if not already present
//             await Post.updateOne(
//                 { _id: post._id },
//                 { $set: { images: [] }, $unset: { imageUrl: "" } }
//             );
//         }
//     } catch (error) {
//         console.error("🚨 Error updating post:", error);
//     }
// };

// // Route to trigger manual update via readline
// router.get('/manual-update', (req, res) => {
//     rl.question("Enter the Post ID to update: ", async (postId) => {
//         await updatePostById(postId.trim());
//         // rl.close();
//         res.status(200).json({ message: "Manual update process completed. Check console for details." });
//     });
// });

// module.exports = router;










//  To update users
// const express = require("express");
// const mongoose = require("mongoose");
// const { User } = require("../models/userModel");
// const axios = require("axios");

// const router = express.Router();
// const IMGBB_API_KEY = "481b5da3b30261c806c57b54707faa1b";

// // Upload image to ImgBB
// const uploadToImgBB = async (imageUrl) => {
//     if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.startsWith("http")) {
//         console.error("❌ Invalid image URL:", imageUrl);
//         return null;
//     }
//     try {
//         console.log("📤 Uploading Image:", imageUrl);
//         const response = await axios.post("https://api.imgbb.com/1/upload", null, {
//             params: { key: IMGBB_API_KEY, image: imageUrl },
//         });

//         if (response.data.success) {
//             console.log("✅ Image uploaded:", response.data.data.display_url);
//             return response.data.data;
//         }
//         return null;
//     } catch (error) {
//         console.error("❌ Error uploading:", error.response?.data || error.message);
//         return null;
//     }
// };

//  Update all users
// const updateAllUsers = async () => {
//     try {
//         const users = await User.find().lean();
//         if (!users.length) {
//             console.log("⚠️ No users found in the database.");
//             return;
//         }

//         console.log(`🔄 Updating ${users.length} users...`);
//         let updatedCount = 0;
//         let failedUsers = [];

//         for (const user of users) {
//             console.log(`➡️ Processing user: ${user._id} (${user.username})`);
            
//             let profileImage = null, bannerImage = null;

//             if (user.profileImageUrl) {
//                 console.log("📸 Found profile image URL:", user.profileImageUrl);
//                 profileImage = await uploadToImgBB(user.profileImageUrl);
//             }
//             if (user.bannerImageUrl) {
//                 console.log("🏞️ Found banner image URL:", user.bannerImageUrl);
//                 bannerImage = await uploadToImgBB(user.bannerImageUrl);
//             }

//             try {
//                 await User.updateOne(
//                     { _id: user._id },
//                     {
//                         $set: {
//                             profileImage: profileImage
//                                 ? {
//                                       imageId: profileImage.id,
//                                       url: profileImage.url,
//                                       thumbUrl: profileImage.thumb?.url || "",
//                                       displayUrl: profileImage.display_url,
//                                   }
//                                 : user.profileImage,
//                             bannerImage: bannerImage
//                                 ? {
//                                       imageId: bannerImage.id,
//                                       url: bannerImage.url,
//                                       thumbUrl: bannerImage.thumb?.url || "",
//                                       displayUrl: bannerImage.display_url,
//                                   }
//                                 : user.bannerImage,
//                         },
//                         $unset: {
//                             profileImageUrl: "",
//                             bannerImageUrl: "",
//                         },
//                     }
//                 );
//                 updatedCount++;
//                 console.log(`✅ Successfully updated user: ${user._id}`);
//             } catch (error) {
//                 console.error(`🚨 Failed to update user: ${user._id}`, error);
//                 failedUsers.push(user._id);
//             }
//         }

//         console.log(`🎉 Update completed! Updated: ${updatedCount}, Failed: ${failedUsers.length}`);
//         if (failedUsers.length) console.log("⚠️ Failed Users:", failedUsers);
//     } catch (error) {
//         console.error("🚨 Error updating users:", error);
//     }
// };

// // Route to trigger the update
// router.get("/update-users", async (req, res) => {
//     await updateAllUsers();
//     res.status(200).json({ message: "User update process completed. Check console for details." });
// });

// module.exports = router;
