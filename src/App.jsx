// src/App.jsx
import { useState, useEffect } from 'react';
import SplashScreen from './components/SplashScreen';
import LoadingScreen from './components/LoadingScreen';
import StoryScreen from './components/StoryScreen'; // Import our new screen
import { loadModels } from './utils/modelLoader';

const APP_STATE = {
  SPLASH: 'SPLASH',
  LOADING: 'LOADING',
  STORY: 'STORY',
};

function App() {
  const [appState, setAppState] = useState(APP_STATE.SPLASH);
  const [baselineMood, setBaselineMood] = useState(null);

  useEffect(() => {
    loadModels();
  }, []);

  const handleStart = () => {
    setAppState(APP_STATE.LOADING);
  };

  const handleMoodDetected = (mood) => {
    console.log('Baseline mood set:', mood);
    setBaselineMood(mood);
    setAppState(APP_STATE.STORY);
  };

  const renderCurrentScreen = () => {
    switch (appState) {
      case APP_STATE.SPLASH:
        return <SplashScreen onStart={handleStart} />;

      case APP_STATE.LOADING:
        return <LoadingScreen onMoodDetected={handleMoodDetected} />;

      case APP_STATE.STORY:
        // --- THIS IS THE CHANGE! ---
        // We now render the real StoryScreen
        return <StoryScreen baselineMood={baselineMood} />;

      default:
        return <SplashScreen onStart={handleStart} />;
    }
  };

  // We return the component directly to prevent layout bugs
  return renderCurrentScreen();
}

export default App;