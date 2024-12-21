import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageSquare, LoaderIcon, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import { motion, AnimatePresence } from "framer-motion";
import AdminBadge from '@/components/ui/AdminBadge';
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";

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
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = useMemo(() => {
    return data?.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Users className="w-5 h-5" />
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus={false}
              className="pl-8"
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mr-4 pr-4">
          {isLoadingModalData ? (
            <div className="flex items-center justify-center py-8">
              <LoaderIcon className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                className="space-y-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {filteredUsers?.map((user, index) => (
                  <motion.div 
                    key={user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: index * 0.03 }
                    }}
                    className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-all duration-200"
                  >
                    <div 
                      className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
                      onClick={() => {
                        navigate(`/profile/${user.username}`);
                        onClose();
                      }}
                    >
                      {user.profileImageUrl ? (
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          src={user.profileImageUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover border border-border shadow-sm"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <DefaultAvatar onClick={() => navigate(`/profile/${user.username}`)} className="w-10 h-10 rounded-full object-cover border border-border shadow-sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
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
                    <div className="flex gap-1.5 ml-2">
                      {user._id !== currentUserId && (
                        <>
                          <Button
                            variant={user.followers?.includes(currentUserId) ? "secondary" : "default"}
                            size="sm"
                            disabled={followLoading[user._id]}
                            onClick={(e) => {
                              e.stopPropagation();
                              onFollowToggle(user._id);
                            }}
                            className="transition-all duration-200 h-8 px-2"
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
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/messages/${user.username}`);
                              onClose();
                            }}
                            className="transition-all duration-200 h-8 px-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
                {filteredUsers?.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No users found
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal; 