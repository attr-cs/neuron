import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageSquare, LoaderIcon, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../assets/default_profile_avatar.png";
import { motion, AnimatePresence } from "framer-motion";
import AdminBadge from '@/components/ui/AdminBadge';

const FollowModal = ({ 
  isOpen, 
  onClose, 
  data, 
  type, 
  currentUserId, 
  onFollowToggle, 
  followLoading,
  isLoadingModalData 
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5" />
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          {isLoadingModalData ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {data?.map((user, index) => (
                  <motion.div 
                    key={user._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.05 }
                    }}
                    className="group flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-all duration-300"
                  >
                    <div 
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        onClose();
                      }}
                    >
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        src={user.profileImageUrl || defaultImage}
                        alt={user.username}
                        className="w-12 h-12 rounded-full object-cover border-2 border-background shadow-sm"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate group-hover:text-primary transition-colors">
                            {user.firstname} {user.lastname}
                          </p>
                          {user.isAdmin && <AdminBadge />}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant={user.followers?.includes(currentUserId) ? "secondary" : "default"}
                        size="sm"
                        disabled={followLoading[user._id]}
                        onClick={(e) => {
                          e.stopPropagation();
                          onFollowToggle(user._id);
                        }}
                        className="transition-all duration-300"
                      >
                        {followLoading[user._id] ? (
                          <LoaderIcon className="h-4 w-4 animate-spin" />
                        ) : user.followers?.includes(currentUserId) ? (
                          <UserCheck className="h-4 w-4" />
                        ) : (
                          <UserPlus className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigate(`/messages/${user.username}`);
                          onClose();
                        }}
                        className="transition-all duration-300"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal; 