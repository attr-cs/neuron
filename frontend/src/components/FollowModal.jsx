import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageSquare, LoaderIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import defaultImage from "../assets/default_profile_avatar.png";

const FollowModal = ({ 
  isOpen, 
  onClose, 
  data, 
  type, 
  currentUserId, 
  onFollowToggle, 
  followLoading 
}) => {
  const navigate = useNavigate();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{type === 'followers' ? 'Followers' : 'Following'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-4">
            {data?.map((user) => (
              <div 
                key={user._id} 
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => {
                    navigate(`/profile/${user.username}`);
                    onClose();
                  }}
                >
                  <img
                    src={user.profileImageUrl || defaultImage}
                    alt={user.username}
                    className="w-10 h-10 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="font-medium">{user.firstname} {user.lastname}</p>
                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={user.followers?.includes(currentUserId) ? "secondary" : "default"}
                    size="sm"
                    disabled={followLoading[user._id]}
                    onClick={(e) => {
                      e.stopPropagation();
                      onFollowToggle(user._id);
                    }}
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
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal; 