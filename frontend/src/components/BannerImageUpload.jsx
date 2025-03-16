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

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      
      // Compress image before upload
      const options = {
        maxSizeMB: 1, // Compress to 1MB
        maxWidthOrHeight: 1920,
        useWebWorker: true
      };
      const compressedFile = await imageCompression(file, options);
      
      // Upload to ImgBB
      const imageData = await uploadImage(compressedFile);
      
      // Update user profile
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/update-banner-image`,
        { imageData },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );

      // Update state and notify
      onImageUpdate(response.data.bannerImage);
      
      toast({
        title: "Success",
        description: "Banner image updated successfully",
      });
    } catch (error) {
      console.error('Error updating banner image:', error);
      toast({
        title: "Error",
        description: "Failed to update banner image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-full h-48 sm:h-64 group cursor-pointer overflow-hidden">
      {/* Background gradient when no image */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40" />
      
      {/* Banner Image */}
        {currentImage && (
        <img
          src={currentImage}
          alt="Banner"
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      )}
      
      {/* Hover Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        ) : (
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-6 h-6" />
            <span>Change Banner</span>
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