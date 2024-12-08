import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function UserStatus({ isOnline, lastVisited }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={isOnline ? "success" : "secondary"}>
        {isOnline ? "Online" : "Offline"}
      </Badge>
      {!isOnline && lastVisited && (
        <span className="text-sm text-muted-foreground">
          Last seen {format(new Date(lastVisited), 'MMM d, yyyy')}
        </span>
      )}
    </div>
  );
} 