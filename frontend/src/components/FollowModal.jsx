import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageSquare, LoaderIcon, Users, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DefaultAvatar from '@/components/ui/DefaultAvatar';
import AdminBadge from '@/components/ui/AdminBadge';
import { Input } from "@/components/ui/input";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const FollowModal = ({ 
  isOpen, 
  onClose, 
  data = [],
  type, 
  currentUserId, 
  onFollowToggle, 
  followLoading,
  isLoadingModalData 
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [optimisticFollowStates, setOptimisticFollowStates] = useState({});

  const filteredUsers = useMemo(() => {
    return data?.filter(user => 
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastname.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const handleFollowToggle = async (userId) => {
    if (followLoading[userId]) return;

    // Get current follow state
    const isCurrentlyFollowing = data.find(user => user._id === userId)?.followers?.includes(currentUserId);
    
    // Set optimistic state
    setOptimisticFollowStates(prev => ({
      ...prev,
      [userId]: !isCurrentlyFollowing
    }));

    try {
      await onFollowToggle(userId);
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticFollowStates(prev => ({
        ...prev,
        [userId]: isCurrentlyFollowing
      }));
    }
  };

  const isFollowing = (userId) => {
    // Use optimistic state if available, otherwise use data state
    return optimisticFollowStates.hasOwnProperty(userId) 
      ? optimisticFollowStates[userId]
      : data.find(user => user._id === userId)?.followers?.includes(currentUserId);
  };

  console.log('FollowModal props:', {
    isOpen,
    data,
    type,
    currentUserId,
    isLoadingModalData
  });

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg h-[60vh] flex flex-col bg-background p-0 border shadow-lg">
      <DialogHeader className="px-6 py-4 border-b sticky top-0 z-10 bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
              <Users className="w-5 h-5 text-primary" />
              {type === 'followers' ? 'Followers' : 'Following'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-10 bg-muted/50 border-0 ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus={false}
              tabIndex={-1}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full overflow-y-auto">
          <div className="px-3 py-2">
            {isLoadingModalData ? (
              <div className="flex items-center justify-center py-12">
                <LoaderIcon className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : data.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No users found</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mb-3 text-muted-foreground/50" />
                <p className="text-sm font-medium">No matches found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="space-y-1">
                {filteredUsers.map((user) => (
                  <div 
                    key={user._id}
                    className="group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {(user.profileImage?.thumbUrl) ? (
                        <img
                          src={user.profileImage.thumbUrl}
                          alt={user.username}
                          className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-muted"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <DefaultAvatar className="w-10 h-10 rounded-full object-cover shadow-sm ring-1 ring-muted" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate text-sm group-hover:text-primary transition-colors">
                            {user.firstname} {user.lastname}
                          </p>
                          {user.isAdmin && <AdminBadge />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {user._id !== currentUserId && (
                      <div className="flex gap-2 ml-3 shrink-0" onClick={e => e.stopPropagation()}>
                        <Button
                          variant={followLoading[user._id] ? 
                            (isFollowing(user._id) ? "outline" : "default") :
                            (isFollowing(user._id) ? "outline" : "default")
                          }
                          size="icon"
                          disabled={followLoading[user._id]}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleFollowToggle(user._id);
                          }}
                          className={cn(
                            "shrink-0 transition-all duration-300",
                            "h-8 w-8",
                            isFollowing(user._id)
                              ? "hover:bg-primary/10 hover:text-primary"
                              : "hover:bg-primary/90"
                          )}
                        >
                          {followLoading[user._id] ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isFollowing(user._id) ? (
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
                          className="h-8 px-3"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;