import { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Users, BookOpen } from "lucide-react";

const FollowersCount = memo(({ followers, following, posts }) => {
  return (
    <div className="flex gap-6 pt-4 border-t border-border/40">
      <Button variant="ghost" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-semibold">{followers}</span>
        <span className="text-muted-foreground">Followers</span>
      </Button>
      <Button variant="ghost" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="font-semibold">{following}</span>
        <span className="text-muted-foreground">Following</span>
      </Button>
      <Button variant="ghost" className="flex items-center gap-2">
        <BookOpen className="h-4 w-4" />
        <span className="font-semibold">{posts}</span>
        <span className="text-muted-foreground">Posts</span>
      </Button>
    </div>
  );
});

export default FollowersCount; 


