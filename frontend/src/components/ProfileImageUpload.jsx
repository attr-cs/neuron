import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import uploadImage from '@/utils/uploadImage';
import axios from 'axios';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { authState } from '@/store/atoms';
import defaultAvatar from "@/utils/defaultAvatar";
import { userBasicInfoState } from '@/store/atoms';

export const ProfileImageUpload = ({ 
  currentImage, 
  onImageUpdate,
  size = "lg"
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const setUserBasicInfo = useSetRecoilState(userBasicInfoState);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();
  const auth = useRecoilValue(authState);

  const sizes = {
    sm: "w-20 h-20",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedImage || isUploading) return;

    try {
      setIsUploading(true);
      
      // Upload to ImgBB
      const imageData = await uploadImage(selectedImage);
      
      // Update user profile - using POST instead of PATCH
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/user/update-profile-image`,
        { imageData },
        {
          headers: { Authorization: `Bearer ${auth.token}` }
        }
      );

      // Cleanup
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      // Update state and notify
      onImageUpdate(response.data.profileImage);
      setSelectedImage(null);
      setPreviewUrl(null);
      setUserBasicInfo(prev => ({
        ...prev,
        profileImage: response.data.profileImage
      }));
      toast({
        title: "Success",
        description: "Profile image updated successfully",
      });
      setIsUploading(false);
      setIsHovering(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // Handle click on the entire image area
  const handleImageClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading && !selectedImage) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div
      className={`relative ${sizes[size]} rounded-full group`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Clickable image wrapper */}
      <div 
        className="w-full h-full cursor-pointer"
        onClick={handleImageClick}
        role="button"
        tabIndex={0}
      >
        <img
          src={previewUrl || currentImage || defaultAvatar}
          alt="Profile"
          className={`${sizes[size]} rounded-full  bg-white border-4 border-background object-cover shadow-lg`}
          referrerPolicy="no-referrer"
        />
      </div>

      <AnimatePresence>
        {(isHovering || selectedImage) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {!selectedImage ? (
              <div 
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onClick={handleImageClick}
              >
                <Camera className="h-5 w-5 text-white" />
              </div>
            ) : isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            ) : (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-black/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUpload();
                  }}
                  disabled={isUploading}
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-white hover:bg-black/30"
                  onClick={(e) => {
                    e.stopPropagation();
                    cancelUpload();
                  }}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

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