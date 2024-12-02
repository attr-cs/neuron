import axios from "axios";

async function fetchUserData(username, token) {
  if (!username || !token) {
    throw new Error("Username and token are required");
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/user/userdetails/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    if (!response.data?.user) {
      throw new Error("Invalid response format");
    }

    // Ensure followers array exists
    return {
      ...response.data.user,
      followers: response.data.user.followers || [],
      following: response.data.user.following || [],
      posts: response.data.user.posts || []
    };
  } catch (error) {
    if (error.response?.status === 429) {
      throw new Error("Too many requests. Please try again later.");
    }
    throw new Error(error.response?.data?.msg || "Failed to fetch user data");
  }
}

export default fetchUserData