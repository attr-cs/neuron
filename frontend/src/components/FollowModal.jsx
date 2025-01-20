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
      <DialogContent className="max-w-[95vw] w-full sm:max-w-md md:max-w-lg h-[85vh] flex flex-col bg-background p-0 border shadow-lg">
        <DialogHeader className="px-6 py-4 border-b sticky top-0 z-10 bg-background">
          <DialogTitle className="flex items-center gap-2.5 text-lg font-semibold">
            <Users className="w-5 h-5 text-primary" />
            {type === 'followers' ? 'Followers' : 'Following'}
          </DialogTitle>
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
            ) : (
              <div className="space-y-1">
                {filteredUsers?.map((user) => (
                  <div 
                    key={user._id}
                    className="group flex items-center justify-between px-3 py-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => {
                      navigate(`/profile/${user.username}`);
                      onClose();
                    }}
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
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
                          variant={user.followers?.includes(currentUserId) ? "secondary" : "default"}
                          size="sm"
                          disabled={followLoading[user._id]}
                          onClick={() => onFollowToggle(user._id)}
                          className="h-8 px-3 text-xs font-medium"
                        >
                          {followLoading[user._id] ? (
                            <LoaderIcon className="h-3.5 w-3.5 animate-spin" />
                          ) : user.followers?.includes(currentUserId) ? (
                            <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                          ) : (
                            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          {user.followers?.includes(currentUserId) ? 'Following' : 'Follow'}
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
                {filteredUsers?.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mb-3 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No users found</p>
                    <p className="text-xs mt-1">Try a different search term</p>
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