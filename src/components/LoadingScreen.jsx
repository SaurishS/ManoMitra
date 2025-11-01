// src/components/LoadingScreen.jsx
import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';

// --- (All the logic and timer constants are identical) ---
const DETECTION_TIMEOUT_MS = 15000;
const DETECTION_INTERVAL_MS = 750;

function LoadingScreen({ onMoodDetected }) {
  const videoRef = useRef(null);
  const [statusText, setStatusText] = useState('Starting camera...');
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const isDetectionDone = useRef(false);

  // --- (All the logic functions: cleanup, useEffect, handleVideoPlay ---
  // --- are identical and correct. No changes needed there.) ---
  const cleanup = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setStatusText('Error: Could not access camera.');
      }
    };
    startVideo();
    return cleanup;
  }, []);

  const handleVideoPlay = () => {
    if (intervalRef.current) return;
    setStatusText('Analyzing your... aura.');

    const detectFace = async () => {
      if (isDetectionDone.current || !videoRef.current) return;
      const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks(true).withFaceExpressions();

      if (detections && !isDetectionDone.current) {
        isDetectionDone.current = true;
        const dominantEmotion = Object.keys(detections.expressions).reduce(
          (a, b) => (detections.expressions[a] > detections.expressions[b] ? a : b)
        );
        console.log('Smart loop success! Emotion:', dominantEmotion);
        setStatusText('Done!');
        cleanup();
        setTimeout(() => onMoodDetected(dominantEmotion), 1200);
      } else if (!detections) {
        console.log('No face detected, trying again...');
      }
    };

    intervalRef.current = setInterval(detectFace, DETECTION_INTERVAL_MS);
    timeoutRef.current = setTimeout(() => {
      if (!isDetectionDone.current) {
        isDetectionDone.current = true;
        console.log('Timeout: No face detected, defaulting to neutral.');
        setStatusText('Could not detect face... continuing.');
        cleanup();
        setTimeout(() => onMoodDetected('neutral'), 1500);
      }
    }, DETECTION_TIMEOUT_MS);
  };

  // --- NEW UI LAYOUT (THE FIX) ---
  return (
    // 1. Main container: This is our anchor
    <div className="relative h-screen w-screen overflow-hidden bg-theme-purple">
      
      {/* 2. Top Banner (z-20) */}
      {/* Positioned 8 units from the top, centered horizontally */}
      <div className="absolute top-8 left-1/2 z-20 w-full max-w-xs -translate-x-1/2 px-8">
        <div className="w-full rounded-full bg-theme-text p-3 shadow-button-3d">
          <p className="text-center font-display text-lg text-white">
            {statusText.toUpperCase()}!!
          </p>
        </div>
      </div>

      {/* 3. Middle Content (z-20) */}
      {/* Centered perfectly in the middle of the screen */}
      <div className="absolute top-[45%] left-1/2 z-20 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        
        {/* The Live Video Feed */}
        <div className="relative h-64 w-64">
          <video
            ref={videoRef}
            autoPlay
            muted
            onPlay={handleVideoPlay}
            className="h-full w-full rounded-full object-cover"
            style={{ transform: "scaleX(-1)" }}
          />
        </div>
        
        {/* The Text Below */}
        <p className="mt-8 text-center font-display text-2xl text-theme-text">
          DOING EINSTEIN LEVEL CALCULATIONS...
        </p>
      </div>

      {/* 4. Bottom Graphics (z-10) */}
      {/* Positioned at the bottom, behind the middle content */}
      <img
        src="/assets/leaves-footer.png"
        alt="UI Graphics"
        className="absolute bottom-0 left-0 z-10 w-full pointer-events-none"
      />
    </div>
  );
}

export default LoadingScreen;