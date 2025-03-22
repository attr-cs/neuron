import { useState, useEffect, useRef } from 'react';
import { Phone, Video, Mic, MicOff, PhoneOff, Camera, CameraOff, RotateCcw, Monitor, Clock, PictureInPicture } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';

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
  onSwitchCamera,
  onShareScreen,
  onTogglePiP,
  onAdjustVolume,
  onToggleBackgroundBlur,
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isPiP, setIsPiP] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isBackgroundBlurred, setIsBackgroundBlurred] = useState(false);
  const [isSelfLarge, setIsSelfLarge] = useState(false); // Toggle for swapping video sizes
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      setIsAudioEnabled(localStream.getAudioTracks()[0]?.enabled ?? true);
      setIsVideoEnabled(localStream.getVideoTracks()[0]?.enabled ?? true);
      if (isPiP && localVideoRef.current.requestPictureInPicture) {
        localVideoRef.current.requestPictureInPicture().catch((err) => console.error('PiP Error:', err));
      }
    }
    return () => {
      if (localVideoRef.current) localVideoRef.current.srcObject = null;
    };
  }, [localStream, isPiP]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.volume = volume;
    }
    return () => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    };
  }, [remoteStream, volume]);

  useEffect(() => {
    if (callStatus === 'connected') {
      intervalRef.current = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [callStatus]);

  const handleToggleAudio = () => {
    const newState = onToggleAudio();
    setIsAudioEnabled(newState);
  };

  const handleToggleVideo = () => {
    const newState = onToggleVideo();
    setIsVideoEnabled(newState);
  };

  const handleDoubleTap = () => {
    if (window.innerWidth <= 768) handleToggleAudio();
  };

  const handleSwitchCamera = () => onSwitchCamera();
  const handleShareScreen = () => {
    onShareScreen();
    setIsScreenSharing(!isScreenSharing);
  };

  const handlePiP = () => {
    setIsPiP(!isPiP);
    onTogglePiP();
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume[0]);
    onAdjustVolume(newVolume[0]);
  };

  const handleBackgroundBlur = () => {
    setIsBackgroundBlurred(!isBackgroundBlurred);
    onToggleBackgroundBlur(!isBackgroundBlurred);
  };

  const handleSwapVideos = () => {
    setIsSelfLarge(!isSelfLarge);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className={`p-0 gap-0 bg-gradient-to-br from-gray-900 to-black border-none rounded-xl shadow-2xl transition-all duration-300 ${
          window.innerWidth <= 768 ? 'w-full h-full m-0 max-w-none max-h-none' : 'max-w-[90vw] md:max-w-[700px] lg:max-w-[900px] h-[90vh] md:h-[600px]'
        }`}
      >
        <div className="flex flex-col h-full relative" onDoubleClick={handleDoubleTap}>
          {/* Video Container */}
          <div className="relative flex-1 bg-zinc-900 overflow-hidden">
            {callStatus === 'reconnecting' && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                <span className="text-white text-lg animate-pulse">Reconnecting...</span>
              </div>
            )}
            {isVideo && remoteStream && localStream ? (
              <>
                {/* Large Video */}
                <video
                  ref={isSelfLarge ? localVideoRef : remoteVideoRef}
                  autoPlay
                  playsInline
                  muted={isSelfLarge}
                  className="w-full h-full object-cover"
                  style={{ filter: isBackgroundBlurred && !isSelfLarge ? 'blur(5px)' : 'none' }}
                />
                {/* Small Video */}
                <div
                  className="absolute bottom-6 right-6 w-24 md:w-40 h-16 md:h-24 bg-black rounded-lg overflow-hidden border-2 border-white/30 shadow-md cursor-pointer"
                  onClick={handleSwapVideos}
                >
                  <video
                    ref={isSelfLarge ? remoteVideoRef : localVideoRef}
                    autoPlay
                    playsInline
                    muted={!isSelfLarge}
                    className="w-full h-full object-cover"
                    style={{ filter: isBackgroundBlurred && isSelfLarge ? 'blur(5px)' : 'none' }}
                  />
                </div>
              </>
            ) : isVideo ? (
              <div className="flex items-center justify-center h-full bg-zinc-800">
                <span className="text-gray-400 text-xl">Waiting for video...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-zinc-800">
                {callStatus === 'ringing' ? (
                  <div className="w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
                    <span className="text-5xl text-primary font-bold">{recipientName?.[0]?.toUpperCase()}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 text-xl">Audio Call</span>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 bg-gray-900/95 backdrop-blur-md border-t border-gray-800 flex flex-col gap-3 z-20">
            <div className="flex items-center justify-between text-gray-200 text-sm font-medium">
              <span>
                {callStatus === 'connected'
                  ? `${isVideo ? 'Video' : 'Audio'} call with ${recipientName} • ${formatDuration(callDuration)}`
                  : isCaller
                  ? `Calling ${recipientName}...`
                  : `Incoming call from ${recipientName}`}
              </span>
              <span>{callStatus === 'connected' ? 'Good' : callStatus === 'reconnecting' ? 'Poor' : ''}</span>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
              <TooltipProvider>
                {isVideo && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleToggleVideo}
                          className={`rounded-full transition-transform hover:scale-105 border-none ${
                            isVideoEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          {isVideoEnabled ? (
                            <Camera className="h-5 w-5 text-white" />
                          ) : (
                            <CameraOff className="h-5 w-5 text-white" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isVideoEnabled ? 'Turn off video' : 'Turn on video'}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleSwitchCamera}
                          className="rounded-full bg-gray-600 hover:bg-gray-700 transition-transform hover:scale-105 border-none"
                        >
                          <RotateCcw className="h-5 w-5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Switch camera</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleShareScreen}
                          className={`rounded-full transition-transform hover:scale-105 border-none ${
                            isScreenSharing ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          <Monitor className="h-5 w-5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</TooltipContent>
                    </Tooltip>
                  </>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleToggleAudio}
                      className={`rounded-full transition-transform hover:scale-105 border-none ${
                        isAudioEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                    >
                      {isAudioEnabled ? (
                        <Mic className="h-5 w-5 text-white" />
                      ) : (
                        <MicOff className="h-5 w-5 text-white" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isAudioEnabled ? 'Mute' : 'Unmute'}</TooltipContent>
                </Tooltip>
                {isVideo && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handlePiP}
                          className="rounded-full bg-gray-600 hover:bg-gray-700 transition-transform hover:scale-105 border-none"
                        >
                          <PictureInPicture className="h-5 w-5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Picture-in-Picture</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleBackgroundBlur}
                          className={`rounded-full transition-transform hover:scale-105 border-none ${
                            isBackgroundBlurred ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
                          }`}
                        >
                          <Monitor className="h-5 w-5 text-white" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{isBackgroundBlurred ? 'Remove blur' : 'Blur background'}</TooltipContent>
                    </Tooltip>
                  </>
                )}
                {!isCaller && callStatus !== 'connected' && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        size="icon"
                        onClick={onAnswer}
                        className="rounded-full bg-green-600 hover:bg-green-700 transition-transform hover:scale-105 border-none"
                      >
                        <Phone className="h-5 w-5 text-white" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Answer call</TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={onHangup}
                      className="rounded-full bg-red-600 hover:bg-red-700 transition-transform hover:scale-105 border-none"
                    >
                      <PhoneOff className="h-5 w-5 text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>End call</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {callStatus === 'connected' && (
              <div className="flex items-center justify-center gap-2">
                <span className="text-white text-sm">Volume:</span>
                <Slider
                  value={[volume]}
                  max={1}
                  min={0}
                  step={0.01}
                  onValueChange={handleVolumeChange}
                  className="w-32 md:w-48"
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallInterface;