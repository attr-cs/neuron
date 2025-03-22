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
    this.onConnectionStateChanged = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = null;
  }

  async initialize(userId) {
    try {
      if (this.peer) this.peer.destroy();

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
        if (this.onCallReceived) this.onCallReceived(call);
        call.on('stream', (remoteStream) => {
          console.log('Received remote stream:', remoteStream.getTracks());
          if (this.onStreamReceived) this.onStreamReceived(remoteStream);
        });
        call.on('close', () => {
          console.log('Call closed by remote');
          this.endCall();
        });
        this.monitorConnection(call);
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

  monitorConnection(call) {
    call.peerConnection.oniceconnectionstatechange = () => {
      const state = call.peerConnection.iceConnectionState;
      console.log('ICE Connection State:', state);
      if (this.onConnectionStateChanged) this.onConnectionStateChanged(state);
      if (state === 'disconnected' || state === 'failed') this.handleConnectionError();
    };
  }

  handleConnectionError() {
    this.isInitialized = false;
    if (this.onConnectionStateChanged) this.onConnectionStateChanged('reconnecting');

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
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
      this.endCall();
    }
  }

  async startCall(recipientId, isVideo) {
    if (!this.peer || !this.isInitialized) throw new Error('Peer connection not initialized');

    try {
      const constraints = {
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false,
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000, autoGainControl: true },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream created:', stream.getAudioTracks(), stream.getVideoTracks());
      this.localStream = stream;

      const call = this.peer.call(recipientId, stream, { metadata: { isVideo } });
      this.currentCall = call;

      call.on('stream', (remoteStream) => {
        console.log('Received remote stream:', remoteStream.getTracks());
        if (this.onStreamReceived) this.onStreamReceived(remoteStream);
      });

      call.on('close', () => {
        console.log('Call closed by remote');
        this.endCall();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        this.endCall();
      });

      this.monitorConnection(call);
      return stream;
    } catch (error) {
      console.error('Error starting call:', error);
      throw error;
    }
  }

  async answerCall(call, isVideo) {
    try {
      const constraints = {
        video: isVideo ? { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } } : false,
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 48000, autoGainControl: true },
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Local stream created for answer:', stream.getAudioTracks(), stream.getVideoTracks());
      this.localStream = stream;

      call.answer(stream);
      call.on('stream', (remoteStream) => {
        console.log('Remote stream received in answer:', remoteStream.getTracks());
        if (this.onStreamReceived) this.onStreamReceived(remoteStream);
      });

      call.on('close', () => {
        console.log('Call closed by remote');
        this.endCall();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        this.endCall();
      });

      this.currentCall = call;
      this.monitorConnection(call);
      return stream;
    } catch (error) {
      console.error('Error answering call:', error);
      throw error;
    }
  }

  async switchCamera() {
    if (!this.localStream || !this.currentCall) return;
    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length === 0) return;

    videoTracks.forEach((track) => track.stop());
    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: videoTracks[0].getSettings().facingMode === 'user' ? 'environment' : 'user' },
      audio: true,
    });
    this.localStream = newStream;
    this.currentCall.peerConnection.getSenders().forEach((sender) => {
      if (sender.track.kind === 'video') sender.replaceTrack(newStream.getVideoTracks()[0]);
    });
  }

  async shareScreen() {
    if (!this.currentCall) return;
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const videoTrack = screenStream.getVideoTracks()[0];
    videoTrack.onended = () => this.stopScreenShare();

    this.localStream.getVideoTracks().forEach((track) => track.stop());
    this.localStream = screenStream;
    this.currentCall.peerConnection.getSenders().forEach((sender) => {
      if (sender.track.kind === 'video') sender.replaceTrack(videoTrack);
    });
  }

  stopScreenShare() {
    this.startCall(this.currentCall.peer, true);
  }

  togglePiP() {}
  adjustVolume(volume) {}
  toggleBackgroundBlur(blur) {}

  endCall() {
    if (this.currentCall) {
      this.currentCall.close();
      this.currentCall = null;
    }
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }
    if (this.onCallEnded) this.onCallEnded();
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
    return true;
  }

  toggleVideo() {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log('Video toggled:', videoTrack.enabled);
        return videoTrack.enabled;
      }
    }
    return true;
  }

  cleanup() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.localStream) this.localStream.getTracks().forEach((track) => track.stop());
    if (this.peer) this.peer.destroy();
    this.isInitialized = false;
    this.currentCall = null;
    this.localStream = null;
  }
}

const callService = new CallService();
export default callService;