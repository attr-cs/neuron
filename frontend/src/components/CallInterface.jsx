import { useState, useEffect, useRef } from 'react';
import { Phone, Video, Mic, MicOff, PhoneOff, Camera, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

const CallInterface = ({
  isOpen,
  onClose,
  localStream,
  remoteStream,
  isVideo,
  isCaller,
  recipientName,
  onAnswer,
  onHangup,
  onToggleAudio,
  onToggleVideo
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
    return () => {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    };
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
    return () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    };
  }, [remoteStream]);

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio();
  };

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onHangup();
      }
    }}>
      <DialogContent className="sm:max-w-[600px] p-0 gap-0">
        <div className="flex flex-col h-[600px] bg-black">
          {/* Video Container */}
          <div className="relative flex-1 bg-zinc-900">
            {/* Remote Video (Large) */}
            {isVideo && (
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
            )}
            
            {/* Local Video (Small) */}
            {isVideo && (
              <div className="absolute bottom-4 right-4 w-32 h-48 bg-black rounded-lg overflow-hidden border-2 border-white/20">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                  className="w-full h-full object-cover"
                    />
                  </div>
                )}

            {/* Audio-only UI */}
            {!isVideo && (
              <div className="flex items-center justify-center h-full">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-4xl text-primary">
                    {recipientName?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
                </div>

          {/* Controls */}
          <div className="p-4 bg-background border-t">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {isCaller ? `Calling ${recipientName}...` : `Incoming call from ${recipientName}`}
              </span>
                <div className="flex items-center gap-2">
                      {isVideo && (
                        <Button
                    variant="outline"
                          size="icon"
                    onClick={handleToggleVideo}
                    className={!isVideoEnabled ? "bg-muted" : ""}
                        >
                    {isVideoEnabled ? (
                      <Camera className="h-4 w-4" />
                          ) : (
                      <CameraOff className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleAudio}
                  className={!isAudioEnabled ? "bg-muted" : ""}
                >
                  {isAudioEnabled ? (
                    <Mic className="h-4 w-4" />
                  ) : (
                    <MicOff className="h-4 w-4" />
                  )}
                </Button>
                {!isCaller && (
                      <Button
                        variant="default"
                    size="icon"
                    onClick={onAnswer}
                        className="bg-green-500 hover:bg-green-600"
                      >
                    <Phone className="h-4 w-4" />
                      </Button>
                )}
                      <Button
                        variant="destructive"
                  size="icon"
                  onClick={onHangup}
                >
                  <PhoneOff className="h-4 w-4" />
                    </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallInterface; 