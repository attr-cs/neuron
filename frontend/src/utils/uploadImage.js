import axios from 'axios';
    
const uploadImage = async (file) => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axios.post('https://api.imgbb.com/1/upload', formData, {
      params: {
        key: import.meta.env.VITE_IMGBB_API_KEY
      }
    });

    const { data } = response.data;
    
    return {
      imageId: data.id,
      url: data.url,
      thumbUrl: data.thumb?.url || data.url,
      displayUrl: data.display_url
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export default uploadImage; 
