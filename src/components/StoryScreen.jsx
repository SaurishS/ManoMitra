// src/components/StoryScreen.jsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { Settings, Mic } from 'lucide-react';
import * as faceapi from 'face-api.js';
import SettingsModal from './SettingsModal';
import { useAudioRecorder } from '../utils/useAudioRecorder';
import { transcribeAudio, getAIResponse } from '../utils/aiService';

// The official Tele-MANAS hotline number
const TELE_MANAS_NUMBER = '1-800-89-14416';

function StoryScreen({ baselineMood }) {
  const synth = useRef(window.speechSynthesis);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCameraHidden, setIsCameraHidden] = useState(false);
  const [currentMood, setCurrentMood] = useState(baselineMood);
  const [lastUserMessage, setLastUserMessage] = useState('');

  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);

  // --- NEW STATES FOR CRISIS MODE ---
  const [isInCrisisMode, setIsInCrisisMode] = useState(false);
  const [hotlineNumber, setHotlineNumber] = useState(null);

  const videoRef = useRef(null);
  const intervalRef = useRef(null);

  const { isRecording, startRecording, stopRecording } = useAudioRecorder();

  const playAiAudio = useCallback((textToSpeak) => {
    if (!textToSpeak) return;

    synth.current.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const voices = synth.current.getVoices();
    const preferredVoice = voices.find(
      (voice) => voice.name.includes('Google US English') || voice.name.includes('Samantha') || voice.name.includes('Zira')
    );
    utterance.voice = preferredVoice || voices[0];

    utterance.onstart = () => setIsAiSpeaking(true);
    utterance.onend = () => setIsAiSpeaking(false);

    synth.current.speak(utterance);
  }, []);

  const handleUserSpeech = async (audioBlob) => {
    setIsProcessing(true);

    const transcript = await transcribeAudio(audioBlob);
    setLastUserMessage(transcript);

    // --- NEW LOGIC: Check if we are in Crisis Mode ---
    if (isInCrisisMode) {
      if (transcript.toLowerCase().includes('yes')) {
        // User confirmed they want help
        const helpResponse = `Okay. Please connect with the Tele-MANAS hotline at ${TELE_MANAS_NUMBER}. That's 1-800-89-14416.`;
        setHotlineNumber(TELE_MANAS_NUMBER); // Display the number
        playAiAudio(helpResponse);
        setIsProcessing(false);
        // We stop here and don't continue the story.
      } else {
        // User declined help
        const helpResponse = "Alright. Let's get back to our story.";
        playAiAudio(helpResponse);
        setIsInCrisisMode(false); // Reset crisis mode
        setIsProcessing(false);
      }
      return; // Exit the function
    }

    // --- Existing Crisis Detection ---
    const crisisKeywords = ['harm', 'suicide', 'hopeless', 'want to die'];
    const isCrisis = crisisKeywords.some(keyword => transcript.toLowerCase().includes(keyword));

    if (isCrisis) {
      const crisisResponse = "I'm hearing that you're in a lot of pain. If you'd like, I can help you connect with a support specialist from Tele-MANAS right now. Just say 'yes'.";
      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: transcript },
        { role: 'ai', text: crisisResponse },
      ]);
      playAiAudio(crisisResponse);
      setIsInCrisisMode(true); // --- SET CRISIS MODE ---
      setIsProcessing(false);
    } else {
      // Standard story continuation
      const ai_response = await getAIResponse(
        transcript,
        currentMood,
        chatHistory
      );

      setChatHistory((prev) => [
        ...prev,
        { role: 'user', text: transcript },
        { role: 'ai', text: ai_response },
      ]);
      setIsProcessing(false);
      playAiAudio(ai_response);
    }
  };

  // Welcome message (no change)
  useEffect(() => {
    let firstLine = `Hello, I'm your Saathi. I noticed you might be feeling a bit ${baselineMood}. Let's try a short story to take your mind off things.`;
    if (baselineMood === 'happy') {
      firstLine = `Hello! I'm your Saathi. You seem to be in a great mood! Let's build on that with a story.`;
    }

    setTimeout(() => {
      playAiAudio(firstLine);
    }, 500); 

    setChatHistory([{ role: 'ai', text: firstLine }]);
  }, [baselineMood, playAiAudio]);

  // Mood detection (no change)
  useEffect(() => {
    const startVideo = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) { console.error('Error accessing webcam:', err); }
    };

    const detectMood = async () => {
      if (videoRef.current) {
        const detections = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks(true).withFaceExpressions();
        if (detections) {
          const dominantEmotion = Object.keys(detections.expressions).reduce((a, b) => 
            (detections.expressions[a] > detections.expressions[b] ? a : b)
          );
          setCurrentMood(dominantEmotion);
        }
      }
    };

    startVideo().then(() => {
      if (videoRef.current) {
        videoRef.current.onplaying = () => {
          intervalRef.current = setInterval(detectMood, 2000);
        };
      }
    });

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Mic functions (no change)
  const handleMicPress = () => {
    if (!isAiSpeaking && !isProcessing) {
      synth.current.cancel();
      startRecording();
    }
  };

  const handleMicRelease = () => {
    if (isRecording) {
      stopRecording().then((blob) => {
        if (blob) {
          handleUserSpeech(blob);
        }
      });
    }
  };

  const getMicState = () => {
    if (isAiSpeaking) return 'speaking';
    if (isProcessing) return 'thinking';
    if (isRecording) return 'recording';
    return 'idle';
  };
  const micState = getMicState();

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white">

      {/* Hotline Number Display */}
      {hotlineNumber && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
          <p className="mb-4 text-center text-2xl text-gray-300">
            Please reach out for support:
          </p>
          <h1 className="text-4xl font-bold text-cyan-400">
            {hotlineNumber}
          </h1>
          <p className="mt-2 text-xl text-gray-400">(Tele-MANAS)</p>
        </div>
      )}

      {/* Main Content Area */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
        <button
          onMouseDown={handleMicPress}
          onMouseUp={handleMicRelease}
          onTouchStart={handleMicPress}
          onTouchEnd={handleMicRelease}
          disabled={micState === 'speaking' || micState === 'thinking'}
          className="relative mb-8 focus:outline-none"
        >
          {micState === 'recording' && (
            <div className="absolute h-24 w-24 animate-ping rounded-full bg-cyan-400 opacity-75"></div>
          )}
          {micState === 'thinking' && (
            <div className="absolute h-24 w-24 animate-ping rounded-full bg-yellow-400 opacity-75 [animation-duration:2s]"></div>
          )}
          <Mic 
            size={96} 
            className={`relative transition-colors
              ${micState === 'recording' ? 'text-cyan-400' : ''}
              ${micState === 'idle' ? 'text-white' : ''}
              ${micState === 'thinking' ? 'text-yellow-400' : ''}
              ${micState === 'speaking' ? 'text-gray-600' : ''}
            `} 
          />
        </button>
        <h1 className="text-3xl font-bold text-cyan-400">
          Saathi Story-Weaver
        </h1>
        <p className="mt-4 h-16 text-center text-2xl text-gray-300">
          {micState === 'idle' && 'Press and hold the mic to talk'}
          {micState === 'recording' && 'Listening...'}
          {micState === 'thinking' && 'Thinking...'}
          {micState === 'speaking' && 'Saathi is speaking...'}
        </p>
      </div>

      {/* --- THIS IS THE FIX ---
        It was `</A>` before, now it is the correct `</p>`
      --- */}
      <div className="absolute bottom-4 left-4 z-10 rounded-lg bg-gray-800 p-3 text-sm">
        <p>Current Mood: <strong>{currentMood}</strong></p>
        <p className="mt-2 text-yellow-300">
          User Said: {lastUserMessage || '...'}
        </p>
      </div>

      <button
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-4 right-4 z-10 text-gray-400 hover:text-cyan-400"
      >
        <Settings size={28} />
      </button>
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isCameraHidden={isCameraHidden}
        onToggleCamera={() => setIsCameraHidden(!isCameraHidden)}
      />
      <video
        ref={videoRef}
        autoPlay
        muted
        className={`absolute bottom-4 right-4 z-10 h-32 w-32 rounded-full object-cover transition-opacity duration-300 ${
          isCameraHidden ? 'opacity-0' : 'opacity-100'
        }`}
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  );
}

export default StoryScreen;