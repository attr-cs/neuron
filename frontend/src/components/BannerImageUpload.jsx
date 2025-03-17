import { useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import uploadImage from '@/utils/uploadImage';
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms';
import { Loader2, Camera } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const BannerImageUpload = ({ currentImage, onImageUpdate }) => {
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const auth = useRecoilValue(authState);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  const optimizeImage = async (file) => {
    try {
      // More aggressive compression for banner images
      const options = {
        maxSizeMB: 0.8, // Reduced from 1MB to 0.8MB
        maxWidthOrHeight: 1600, // Reduced from 1920 to 1600
        useWebWorker: true,
        initialQuality: 0.8, // Added initial quality parameter
      };
      
      return await imageCompression(file, options);
    } catch (error) {
      console.error('Error compressing image:', error);
      return file; // Return original file if compression fails
    }
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Show preview immediately
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);

    try {
      // Optimize image in parallel with showing preview
      const compressedFile = await optimizeImage(file);
      
      // Upload to ImgBB
      const imageData = await uploadImage(compressedFile);
      
      // Update user profile
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/update-banner-image`,
        { imageData },
        {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update state and notify
      onImageUpdate(response.data.bannerImage);
      
      toast({
        title: "Success",
        description: "Banner updated successfully",
      });
    } catch (error) {
      console.error('Error updating banner:', error);
      toast({
        title: "Error",
        description: "Failed to update banner. Please try again.",
        variant: "destructive"
      });
      // Revert preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Cleanup preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    }
  };

  // Memoize the background gradient
  const backgroundGradient = "bg-gradient-to-r from-primary/20 to-primary/40";

  return (
    <div className="relative w-full h-48 sm:h-64 group cursor-pointer overflow-hidden">
      {/* Background gradient when no image */}
      <div className={`absolute inset-0 ${backgroundGradient} transition-opacity duration-300`} 
           style={{ opacity: (!previewUrl && !currentImage) ? 1 : 0 }} />
      
      {/* Banner Image with fade-in effect */}
      {(previewUrl || currentImage) && (
        <img
          src={previewUrl || currentImage}
          alt="Banner"
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
          referrerPolicy="no-referrer"
          loading="eager" // Force eager loading for immediate display
        />
      )}
      
      {/* Hover Overlay with improved visual feedback */}
      <div 
        className={`absolute inset-0 bg-black/40 
          ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} 
          transition-opacity duration-200 flex items-center justify-center`}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-white text-sm font-medium">Uploading...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-white transform transition-transform duration-200 hover:scale-105">
            <Camera className="w-6 h-6" />
            <span className="font-medium">Change Banner</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}; 