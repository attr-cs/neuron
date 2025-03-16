import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const ImageDialog = ({ 
  isOpen, 
  onClose, 
  imageUrl,
  className,
  isCircular = false 
}) => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 border-none overflow-hidden bg-black">
        <div className="relative w-full min-h-[300px] flex items-center justify-center">
          {isLoading && (
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          )}
          <img
            src={imageUrl}
            alt="Full size"
            className={cn(
              "max-h-[80vh] object-contain",
              isCircular && "rounded-full",
              isLoading ? "hidden" : "block",
              className
            )}
            onLoad={() => setIsLoading(false)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 