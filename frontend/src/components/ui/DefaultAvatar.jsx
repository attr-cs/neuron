import { User } from "lucide-react";

const DefaultAvatar = ({ className, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`flex items-center justify-center bg-muted rounded-full cursor-pointer ${className}`}
    >
      <User className="w-1/2 h-1/2 text-muted-foreground" />
    </div>
  );
};

export default DefaultAvatar; 