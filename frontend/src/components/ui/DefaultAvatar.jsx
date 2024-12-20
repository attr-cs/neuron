import { User } from "lucide-react";

const DefaultAvatar = ({ className }) => {
  return (
    <div className={`flex items-center justify-center bg-muted rounded-full ${className}`}>
      <User className="w-1/2 h-1/2 text-muted-foreground" />
    </div>
  );
};

export default DefaultAvatar; 