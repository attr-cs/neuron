import axios from 'axios';
    
const uploadImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('key', import.meta.env.VITE_IMGBB_API_KEY);

    const response = await axios.post('https://api.imgbb.com/1/upload', formData);

    if (response.data.success) {
      return response.data.data.display_url;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default uploadImage; 