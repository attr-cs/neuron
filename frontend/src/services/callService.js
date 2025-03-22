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
          console.log('Received remote stream');
          if (this.onStreamReceived) {
            this.onStreamReceived(remoteStream);
          }
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
        audio: true,
      });
      this.localStream = stream;

      const call = this.peer.call(recipientId, stream, { metadata: { isVideo } });
      this.currentCall = call;

      return new Promise((resolve, reject) => {
        call.on('stream', (remoteStream) => {
          console.log('Received remote stream');
          if (this.onStreamReceived) {
            this.onStreamReceived(remoteStream);
          }
          resolve(stream);
        });

        call.on('close', () => {
          console.log('Call closed');
          this.endCall();
          reject(new Error('Call rejected or ended'));
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
        audio: true,
      });
      this.localStream = stream;

      call.answer(stream);
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received in answer');
        if (this.onStreamReceived) {
          this.onStreamReceived(remoteStream);
        }
      });

      call.on('close', () => {
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
        video: true,
        audio: true,
      });
      
      const videoTrack = screenStream.getVideoTracks()[0];
      const sender = this.currentCall.peerConnection.getSenders().find(s => s.track.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }

      screenStream.getVideoTracks()[0].onended = () => {
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
    if (this.localStream) {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      const videoTrack = cameraStream.getVideoTracks()[0];
      const sender = this.currentCall.peerConnection.getSenders().find(s => s.track.kind === 'video');
      
      if (sender) {
        await sender.replaceTrack(videoTrack);
      }
      
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = cameraStream;
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
  }

  rejectCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
      if (this.onCallEnded) {
        this.onCallEnded();
      }
    }
  }

  toggleAudio() {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        return audioTrack.enabled;
      }
    }
    return true; // Default to enabled if no track
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        return videoTrack.enabled;
      }
    }
    return true; // Default to enabled if no track
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