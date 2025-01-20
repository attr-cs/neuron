import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, MessageSquare, LoaderIcon, Users, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DefaultAvatar from '@/components/ui/DefaultAvatar';
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
    <Dialog 
      open={isOpen} 
      onOpenChange={onClose}
    >
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col bg-background p-0 border shadow-lg">
        <DialogHeader className="px-4 py-3 border-b">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-9 bg-muted/50 border-0 ring-offset-0 focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus={false}
              tabIndex={-1}
            />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 w-full">
          <div className="px-2 py-1">
            {isLoadingModalData ? (
              <div className="flex items-center justify-center py-8">
                <LoaderIcon className="w-6 h-6 text-primary" />
              </div>
            ) : (
              <div className="space-y-0.5">
                {filteredUsers?.map((user) => (
                  <div 
                    key={user._id}
                    className="group flex items-center justify-between px-2 py-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.username}
                          className="w-9 h-9 rounded-full object-cover shadow-sm"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                      ) : (
                        <DefaultAvatar className="w-9 h-9 rounded-full object-cover shadow-sm" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="font-medium truncate text-sm group-hover:text-primary">
                            {user.firstname} {user.lastname}
                          </p>
                          {user.isAdmin && <AdminBadge />}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </div>

                    {user._id !== currentUserId && (
                      <div className="flex gap-1.5 ml-2 shrink-0" onClick={e => e.stopPropagation()}>
                        <Button
                          variant={user.followers?.includes(currentUserId) ? "secondary" : "default"}
                          size="sm"
                          disabled={followLoading[user._id]}
                          onClick={() => onFollowToggle(user._id)}
                          className="h-7 px-2 text-xs"
                        >
                          {followLoading[user._id] ? (
                            <LoaderIcon className="h-3 w-3" />
                          ) : user.followers?.includes(currentUserId) ? (
                            <UserCheck className="h-3 w-3" />
                          ) : (
                            <UserPlus className="h-3 w-3" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigate(`/messages/${user.username}`);
                            onClose();
                          }}
                          className="h-7 px-2"
                        >
                          <MessageSquare className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {filteredUsers?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Users className="w-10 h-10 mb-2 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs">Try a different search term</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowModal;