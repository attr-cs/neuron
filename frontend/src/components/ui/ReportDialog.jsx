import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import axios from 'axios';
import { useRecoilValue } from 'recoil';
import { authState } from '@/store/atoms';

const reportReasons = [
  { id: 'spam', label: 'Spam or misleading' },
  { id: 'harassment', label: 'Harassment or bullying' },
  { id: 'hate_speech', label: 'Hate speech or symbols' },
  { id: 'violence', label: 'Violence or dangerous behavior' },
  { id: 'inappropriate', label: 'Inappropriate content' },
  { id: 'copyright', label: 'Intellectual property violation' },
  { id: 'impersonation', label: 'Impersonation or false representation' },
  { id: 'other', label: 'Other' }
];

export function ReportDialog({ 
  isOpen, 
  onClose, 
  targetType, // 'post', 'user', or 'comment'
  targetId,
  targetUser // username or user object of the reported content owner
}) {
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const auth = useRecoilValue(authState);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate that at least one reason is selected
    if (selectedReasons.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one reason for reporting",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/report/create`,
        {
          targetType,
          targetId,
          targetUser,
          reasons: selectedReasons,
          message: customMessage
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast({
          title: "Success",
          description: "Report submitted successfully",
        });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report {targetType}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Select reason(s) for reporting:</h4>
            {reportReasons.map((reason) => (
              <div key={reason.id} className="flex items-center space-x-2">
                <Checkbox
                  id={reason.id}
                  checked={selectedReasons.includes(reason.id)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedReasons([...selectedReasons, reason.id]);
                    } else {
                      setSelectedReasons(selectedReasons.filter(r => r !== reason.id));
                    }
                  }}
                />
                <label
                  htmlFor={reason.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {reason.label}
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Additional details (optional):</label>
            <Textarea
              placeholder="Provide any additional context..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="resize-none"
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 