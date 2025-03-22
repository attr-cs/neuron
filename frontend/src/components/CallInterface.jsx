import { useState, useEffect, useRef } from 'react';
import { Phone, Video, Mic, MicOff, PhoneOff, Camera, CameraOff, Monitor } from 'lucide-react';
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
  onToggleVideo,
  callStatus,
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

  useEffect(() => {
    // Reset states when dialog closes
    return () => {
      setIsAudioEnabled(true);
      setIsVideoEnabled(true);
    };
  }, [isOpen]);

  const handleToggleAudio = () => {
    const newState = onToggleAudio();
    setIsAudioEnabled(newState);
  };

  const handleToggleVideo = () => {
    const newState = onToggleVideo();
    setIsVideoEnabled(newState);
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await callService.shareScreen();
      // Assuming callService is accessible globally or passed as prop
      localVideoRef.current.srcObject = screenStream;
    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onHangup()}>
      <DialogContent className="sm:max-w-[700px] p-0 gap-0 bg-gradient-to-b from-gray-900 to-black border-none rounded-xl shadow-2xl">
        <div className="flex flex-col h-[600px]">
          {/* Video Container */}
          <div className="relative flex-1 bg-zinc-900 overflow-hidden">
            {isVideo && remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-zinc-800">
                <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                  <span className="text-5xl text-primary font-bold">
                    {recipientName?.[0]?.toUpperCase()}
                  </span>
                </div>
              </div>
            )}

            {/* Local Video (Picture-in-Picture) */}
            {isVideo && localStream && (
              <div className="absolute bottom-6 right-6 w-40 h-24 bg-black rounded-lg overflow-hidden border-2 border-white/30 shadow-md">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-300 font-medium">
                {callStatus === 'connected'
                  ? `${isVideo ? 'Video' : 'Audio'} call with ${recipientName}`
                  : isCaller
                  ? `Calling ${recipientName}...`
                  : `Incoming call from ${recipientName}`}
              </span>
              <div className="flex items-center gap-3">
                {isVideo && (
                  <>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShareScreen}
                      className="rounded-full bg-gray-800 hover:bg-gray-600 transition-colors"
                    >
                      <Monitor className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleVideo}
                      className={`rounded-full ${!isVideoEnabled ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-600 transition-colors`}
                    >
                      {isVideoEnabled ? (
                        <Camera className="h-5 w-5 text-white" />
                      ) : (
                        <CameraOff className="h-5 w-5 text-red-400" />
                      )}
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleAudio}
                  className={`rounded-full ${!isAudioEnabled ? 'bg-gray-700' : 'bg-gray-800'} hover:bg-gray-600 transition-colors`}
                >
                  {isAudioEnabled ? (
                    <Mic className="h-5 w-5 text-white" />
                  ) : (
                    <MicOff className="h-5 w-5 text-red-400" />
                  )}
                </Button>
                {!isCaller && callStatus !== 'connected' && (
                  <>
                    <Button
                      variant="default"
                      size="icon"
                      onClick={onAnswer}
                      className="rounded-full bg-green-600 hover:bg-green-700 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={onHangup}
                      className="rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      <PhoneOff className="h-5 w-5" />
                    </Button>
                  </>
                )}
                {(isCaller || callStatus === 'connected') && (
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onHangup}
                    className="rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                  >
                    <PhoneOff className="h-5 w-5" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallInterface;