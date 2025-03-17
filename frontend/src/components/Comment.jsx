import { Mentions } from '@/components/ui/Mentions';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { userBasicInfoState } from '@/store/atoms';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import { ReportDialog } from '@/components/ui/ReportDialog';

const Comment = ({ comment, post }) => {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const userBasicInfo = useRecoilValue(userBasicInfoState);

  return (
    <div className="flex items-start space-x-2 group">
      <div className="comment">
        <Mentions text={comment.content} />
      </div>
      
      {comment.author?._id !== userBasicInfo._id && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
              Report comment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <ReportDialog
        isOpen={showReportDialog}
        onClose={() => setShowReportDialog(false)}
        targetType="comment"
        targetId={comment._id}
        targetUser={comment.author}
      />
    </div>
  );
}; 