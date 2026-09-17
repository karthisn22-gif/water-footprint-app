import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WebcamCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const { t } = useTranslation();
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const stopCamera = () => {
    console.log("Stopping camera stream...");
    
    // 1. Stop the specific stream tracked by ref
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
        console.log("Track stopped from ref:", track.kind);
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // 2. BULLETPROOF GLOBAL KILL-SWITCH:
    // In React development (Strict Mode) or during rapid tab switching, 
    // it's possible for getUserMedia promises to resolve completely orphaned from the component.
    // This tracks every single stream ever requested by this browser session and kills them all.
    if (window.activeCameraStreams) {
      window.activeCameraStreams.forEach(s => {
        if (s && typeof s.getTracks === 'function') {
          s.getTracks().forEach(track => {
            track.stop();
            console.log("Track stopped from global tracker:", track.kind);
          });
        }
      });
      window.activeCameraStreams = [];
    }
  };

  useEffect(() => {
    let isMounted = true;
    let localStream = null;

    const initCamera = async () => {
      setError(null);
      stopCamera(); // Stop any existing streams first
      
      try {
        let stream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
          });
        } catch (initialErr) {
          console.log("Initial camera request failed, trying fallback...", initialErr);
          // Fallback to any available camera if specific constraints fail (common on some phones)
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
        
        // Add to global tracker immediately
        window.activeCameraStreams = window.activeCameraStreams || [];
        window.activeCameraStreams.push(stream);
        
        if (!isMounted) {
          stopCamera(); // Use the global kill switch
          return;
        }

        localStream = stream;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setIsReady(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Camera error:", err);
          setError("Unable to access camera. Please check permissions.");
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      stopCamera();
    };
  }, []);

  const startCamera = () => {
    // Retry function if it failed
    setIsReady(false);
    setError(null);
    // Component handles initialization on mount, so to retry we just force a re-render or let it rely on a key change.
    // For simplicity, we just reload the page or trigger a state refresh in parent in real world, 
    // but here we can just call the logic again.
    window.location.reload(); 
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          stopCamera();
          const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
          onCapture(file);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  if (error) {
    return (
      <div className="webcam-error">
        <p>{error}</p>
        <button onClick={startCamera} className="btn-secondary" style={{ marginTop: '10px' }}>
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="webcam-container">
      <video ref={videoRef} className="webcam-video" playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {isReady && (
        <button className="btn-capture" onClick={takePhoto}>
          <Camera size={24} /> Capture Photo
        </button>
      )}
    </div>
  );
};

export default WebcamCapture;
