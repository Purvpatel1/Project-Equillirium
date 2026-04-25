import { useState, useEffect, useRef } from 'react';
import HomeScreen from './components/screens/HomeScreen';
import BreathingScreen from './components/screens/BreathingScreen';
import MoodScreen from './components/screens/MoodScreen';
import JournalScreen from './components/screens/JournalScreen';
import ResultScreen from './components/screens/ResultScreen';
import { getStreak, saveSession, checkAndUpdateStreak, getLevel } from './utils/storage';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('home');
  const [sessionData, setSessionData] = useState({});
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);

  // Background color state applied to the very root
  const [appBgColor, setAppBgColor] = useState('');
  const [optimisticSession, setOptimisticSession] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(null);
  const [sessionStartTime, setSessionStartTime] = useState(null);

  const loopTimerRef = useRef(null);

  useEffect(() => {
    setStreak(getStreak());
    setLevel(getLevel());
  }, []);

  const resetSession = () => {
    // Native React unmount implicitly handles:
    // setPhase("idle");
    // setMood({ x: 0, y: 0 });
    // setJournal("");
    // setTimer(0);
    setSessionData({});
    setAppBgColor('');
    setOptimisticSession(null);
    setSessionDuration(null);
    setSessionStartTime(null);
  };

  const handleReturnHome = () => {
    resetSession();
    setCurrentScreen('home');
  };

  const handleStartSession = () => {
    if (loopTimerRef.current) clearTimeout(loopTimerRef.current);
    resetSession();
    setSessionStartTime(Date.now());
    setCurrentScreen('breathing');
  };

  const handleCompleteBreathing = (durations) => {
    setSessionData(prev => ({ ...prev, breathingDuration: durations }));
    setCurrentScreen('mood');
  };

  const handleCompleteMood = (mood) => {
    setSessionData(prev => ({ ...prev, mood }));
    setAppBgColor(''); // Reset bg overlay
    setCurrentScreen('journal');
  };

  const handleCompleteJournal = (newSession, dateStr) => {
    // 1. Calculate duration
    if (sessionStartTime) {
      const durationMs = Date.now() - sessionStartTime;
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      setSessionDuration(`${minutes} min ${seconds} sec`);
    }

    // 2. Update UI state instantly to navigate to result
    setOptimisticSession(newSession);
    setCurrentScreen('result');
    console.log("Next screen:", "result");

    // 2. Persist data deferred to prevent blocking
    setTimeout(() => {
      saveSession(newSession);
      const newStreak = checkAndUpdateStreak(dateStr);
      const newLevel = getLevel();
      setStreak(newStreak);
      setLevel(newLevel);
    }, 0);
  };

  // Safe Rendering Fallback Architecture
  const renderScreen = () => {
    if (!currentScreen) return <HomeScreen onStart={handleStartSession} streak={streak} />;
    if (currentScreen === "home") return <HomeScreen onStart={handleStartSession} streak={streak} />;
    if (currentScreen === "breathing") return <BreathingScreen onComplete={handleCompleteBreathing} level={level} />;
    if (currentScreen === "mood") return <MoodScreen onComplete={handleCompleteMood} setAppBgColor={setAppBgColor} />;
    if (currentScreen === "journal") return <JournalScreen sessionData={sessionData} onComplete={handleCompleteJournal} />;
    if (currentScreen === "result") return <ResultScreen onStartNew={handleStartSession} streak={streak} optimisticSession={optimisticSession} onReturnHome={handleReturnHome} level={level} duration={sessionDuration} />;
    
    return <HomeScreen onStart={handleStartSession} streak={streak} />;
  };

  return (
    <div className="animated-gradient-bg min-h-screen flex items-center justify-center w-full relative z-0">
      {/* Mood Screen Color Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-[-1]"
        style={{ 
          backgroundColor: appBgColor || 'transparent',
          transition: 'background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
          filter: 'blur(60px)',
          opacity: 0.3
        }}
      ></div>
      
      {renderScreen()}
    </div>
  );
}
