import Peer from 'peerjs';

class CallService {
  constructor() {
    this.peer = null;
    this.currentCall = null;
    this.isInitialized = false;
    this.localStream = null;
    this.onCallReceived = null;
    this.onCallEnded = null;
    this.onStreamReceived = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  async initialize(userId) {
    try {
      if (this.peer) {
        this.peer.destroy();
      }

      this.peer = new Peer(userId, {
        host: '0.peerjs.com',
        port: 443,
        secure: true,
        path: '/',
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
          ],
        },
        debug: 3,
      });

      this.peer.on('open', (id) => {
        console.log('Peer connection opened:', id);
        this.isInitialized = true;
        this.reconnectAttempts = 0;
      });

      this.peer.on('call', (call) => {
        console.log('Incoming call:', call);
        this.currentCall = call;
        if (this.onCallReceived) {
          this.onCallReceived(call);
        }
        call.on('stream', (remoteStream) => {
          console.log('Received remote stream with audio:', remoteStream.getAudioTracks());
          if (this.onStreamReceived) {
            this.onStreamReceived(remoteStream);
          }
        });
        call.on('close', () => {
          console.log('Call closed remotely');
          this.endCall();
        });
        call.on('error', (err) => {
          console.error('Call error:', err);
          this.endCall();
        });
      });

      this.peer.on('error', (error) => {
        console.error('Peer connection error:', error);
        this.handleConnectionError();
      });

      this.peer.on('disconnected', () => {
        console.log('Peer disconnected');
        this.handleConnectionError();
      });

      this.peer.on('close', () => {
        console.log('Peer connection closed');
        this.handleConnectionError();
      });
    } catch (error) {
      console.error('Error initializing peer:', error);
      this.handleConnectionError();
      throw error;
    }
  }

  handleConnectionError() {
    this.isInitialized = false;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      this.reconnectTimeout = setTimeout(() => {
        if (this.peer && !this.peer.disconnected) {
          this.peer.reconnect();
        } else {
          this.initialize(this.peer.id);
        }
      }, delay);
    } else {
      console.error('Max reconnection attempts reached');
      this.isInitialized = false;
    }
  }

  async startCall(recipientId, isVideo) {
    if (!this.peer || !this.isInitialized) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true, // Ensure audio is always requested
      });
      console.log('Local stream created with audio:', stream.getAudioTracks());
      this.localStream = stream;

      const call = this.peer.call(recipientId, stream, { metadata: { isVideo } });
      this.currentCall = call;

      return new Promise((resolve, reject) => {
        call.on('stream', (remoteStream) => {
          console.log('Received remote stream with audio:', remoteStream.getAudioTracks());
          if (this.onStreamReceived) {
            this.onStreamReceived(remoteStream);
          }
          resolve(stream);
        });

        call.on('close', () => {
          console.log('Call closed by remote peer');
          this.endCall();
          reject(new Error('Call ended by remote peer'));
        });

        call.on('error', (error) => {
          console.error('Call error:', error);
          this.endCall();
          reject(error);
        });
      });
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(call, isVideo) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true, // Ensure audio is always requested
      });
      console.log('Local stream for answer with audio:', stream.getAudioTracks());
      this.localStream = stream;

      call.answer(stream);
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received in answer with audio:', remoteStream.getAudioTracks());
        if (this.onStreamReceived) {
          this.onStreamReceived(remoteStream);
        }
      });

      call.on('close', () => {
        console.log('Call closed by caller');
        this.endCall();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        this.endCall();
      });

      this.currentCall = call;
      return stream;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async shareScreen() {
    if (!this.currentCall) {
      throw new Error('No active call');
    }

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
        },
        audio: true, // Include audio for screen sharing
      });

      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.currentCall.peerConnection.getSenders().find(s => s.track?.kind === 'video');

      if (sender) {
        await sender.replaceTrack(videoTrack);
        console.log('Screen sharing started');
      } else {
        console.error('No video sender found');
        throw new Error('No video sender available');
      }

      screenStream.getVideoTracks()[0].onended = () => {
        console.log('Screen sharing stopped');
        this.restoreCameraStream();
      };

      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = screenStream;
      return screenStream;
    } catch (error) {
      console.error('Error sharing screen:', error);
      throw error;
    }
  }

  async restoreCameraStream() {
    if (!this.currentCall) return;

    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // Ensure audio is restored
      });
      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.currentCall.peerConnection.getSenders().find(s => s.track?.kind === 'video');

      if (sender) {
        await sender.replaceTrack(videoTrack);
        console.log('Restored camera stream with audio:', cameraStream.getAudioTracks());
      }

      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = cameraStream;
    } catch (error) {
      console.error('Error restoring camera stream:', error);
    }
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.onCallEnded) {
      this.onCallEnded();
    }
    console.log('Call ended locally');
  }

  rejectCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
      if (this.onCallEnded) {
        this.onCallEnded();
      }
      console.log('Call rejected locally');
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log('Audio toggled:', audioTrack.enabled);
        return audioTrack.enabled;
      }
    }
    console.log('No audio track available to toggle');
    return true;
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return true;
  }

  cleanup() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }
    if (this.peer) {
      this.peer.destroy();
    }
    this.isInitialized = false;
    this.currentCall = null;
    this.localStream = null;
  }
}

const callService = new CallService();
export default callService;