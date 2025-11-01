// src/utils/useAudioRecorder.js
import { useState, useRef, useEffect } from 'react';

export const useAudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // 1. Ask for permission once
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        setIsPermissionGranted(true);
        console.log('Mic permission granted');
      })
      .catch((err) => {
        console.error('Mic permission denied:', err);
        setIsPermissionGranted(false);
      });
  }, []);

  // 2. Start Recording
  const startRecording = async () => {
    if (!isPermissionGranted) {
      console.error('Cannot record, permission denied.');
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // We record in 'audio/webm', which Gemini supports
    const options = { mimeType: 'audio/webm' }; 
    const mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];

    mediaRecorder.ondataavailable = (event) => {
      audioChunksRef.current.push(event.data);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  // 3. Stop Recording
  const stopRecording = () => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        return resolve(null);
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        resolve(audioBlob); // Send the final Blob back
      };

      mediaRecorderRef.current.stop();
    });
  };

  return { isRecording, startRecording, stopRecording };
};