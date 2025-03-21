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
            { urls: 'stun:stun2.l.google.com:19302' }
          ]
        },
        debug: 3
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

      // Add connection state monitoring
      this.peer.on('connection', () => {
        console.log('Peer connection established');
      });

      this.peer.on('network', (network) => {
        console.log('Network state changed:', network);
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
      
      // Clear any existing timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
      }

      // Exponential backoff for reconnection attempts
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
      // You might want to notify the user here
    }
  }

  async startCall(recipientId, isVideo) {
    if (!this.peer || !this.isInitialized) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });

      const call = this.peer.call(recipientId, stream, {
        metadata: { isVideo }
      });

      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        if (this.onStreamReceived) {
          this.onStreamReceived(remoteStream);
        }
      });

      call.on('close', () => {
        console.log('Call closed');
        if (this.onCallEnded) {
          this.onCallEnded();
        }
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        this.endCall();
      });

      this.currentCall = call;
      return stream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(call, isVideo) {
    if (!this.peer || !this.isInitialized) {
      throw new Error('Peer connection not initialized');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });

      call.answer(stream);

      call.on('error', (error) => {
        console.error('Call error:', error);
        this.endCall();
      });

      return stream;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    if (this.onCallEnded) {
      this.onCallEnded();
    }
  }

  toggleAudio() {
    if (this.currentCall) {
      const audioTrack = this.currentCall.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  }

  toggleVideo() {
    if (this.currentCall) {
      const videoTrack = this.currentCall.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }

  cleanup() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
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