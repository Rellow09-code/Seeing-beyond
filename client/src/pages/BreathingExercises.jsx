import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, ArrowLeft, Volume2, Sun, Moon, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";

const inhaleSound = "https://actions.google.com/sounds/v1/ambiences/soft_bell.ogg";
const exhaleSound = inhaleSound;
const holdSound = inhaleSound;

const exercises = [
  { name: "Deep Belly Breathing", pattern: ["inhale:4", "exhale:6"] },
  { name: "Box Breathing", pattern: ["inhale:4", "hold:4", "exhale:4", "hold:4"] },
  { name: "4-7-8 Relaxation", pattern: ["inhale:4", "hold:7", "exhale:8"] },
  { name: "Alternate Nostril", pattern: ["inhale:4", "exhale:4"] },
  { name: "Pursed-Lip Breathing", pattern: ["inhale:2", "exhale:4"] },
  { name: "Counting Breath", pattern: ["inhale:4", "exhale:4"] },
  { name: "Progressive Relaxation", pattern: ["inhale:4", "exhale:6"] },
  { name: "Resonant Breathing", pattern: ["inhale:5", "exhale:5"] },
  { name: "Lion's Breath", pattern: ["inhale:2", "exhale:4"] },
  { name: "Mindful Breath", pattern: ["inhale:4", "exhale:6"] },
];

export default function BreathingRoutine() {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBetween, setIsBetween] = useState(false);
  const [circleScale, setCircleScale] = useState(1);
  const [preCountdown, setPreCountdown] = useState(0);
  const [voiceRate, setVoiceRate] = useState(0.9);
  const [voiceVolume, setVoiceVolume] = useState(1);
  const [highContrast, setHighContrast] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  
  const audioRef = useRef(null);
  const intervalRef = useRef(null);
  const isSpeaking = useRef(false);
  const navigate = useNavigate();

  // Get current phase information
  const currentPattern = exercises[currentExercise].pattern;
  const [phaseName, phaseDuration] = currentPattern[phaseIndex].split(":");
  const phaseDurationNum = parseInt(phaseDuration);

  // Initialize the timer
  useEffect(() => {
    if (!isRunning) return;
    
    if (isBetween) {
      setSecondsLeft(5);
    } else if (preCountdown > 0) {
      setSecondsLeft(preCountdown);
    } else {
      setSecondsLeft(phaseDurationNum);
    }
  }, [currentExercise, phaseIndex, isBetween, isRunning, phaseDurationNum, preCountdown]);

  const speak = useCallback((text) => {
    if ("speechSynthesis" in window && !isSpeaking.current) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = voiceRate;
      utter.volume = voiceVolume;
      
      utter.onstart = () => {
        isSpeaking.current = true;
      };
      
      utter.onend = () => {
        isSpeaking.current = false;
      };
      
      window.speechSynthesis.speak(utter);
    }
  }, [voiceRate, voiceVolume]);

  const playSound = useCallback((type) => {
    if (audioRef.current) {
      audioRef.current.src =
        type === "inhale" ? inhaleSound : type === "exhale" ? exhaleSound : holdSound;
      audioRef.current.play().catch(() => {});
    }
  }, []);

  // Handle transitions between phases and exercises
  const nextStep = useCallback(() => {
    if (isBetween) {
      // Transition to next exercise
      if (secondsLeft <= 1) {
        const nextExercise = (currentExercise + 1) % exercises.length;
        setCurrentExercise(nextExercise);
        setPhaseIndex(0);
        setIsBetween(false);
        setPreCountdown(3);
        setSecondsLeft(3);
        speak(`Next exercise: ${exercises[nextExercise].name}. Starting soon.`);
      } else {
        setSecondsLeft(secondsLeft - 1);
      }
    } else if (preCountdown > 0) {
      // Pre-countdown in progress
      if (preCountdown === 1) {
        setPreCountdown(0);
        setSecondsLeft(phaseDurationNum);
        speak(`Starting ${phaseName} now`);
        playSound(phaseName);
        if (phaseName === "inhale") {
          setCircleScale(1.5);
        } else if (phaseName === "exhale") {
          setCircleScale(1);
        } else {
          setCircleScale(1.25);
        }
      } else {
        setPreCountdown(preCountdown - 1);
        setSecondsLeft(preCountdown - 1);
        if (preCountdown === 3) {
          speak(`Starting ${phaseName} in 3`);
        }
      }
    } else if (secondsLeft > 0) {
      // Regular countdown
      setSecondsLeft(secondsLeft - 1);
      
      // Give a warning at 3 seconds
      if (secondsLeft === 3) {
        speak(`3 seconds left`);
      }
      
      // Handle animation during breathing phases
      if (phaseName === "inhale") {
        const progress = 1 - (secondsLeft / phaseDurationNum);
        setCircleScale(1 + (0.5 * progress));
      } else if (phaseName === "exhale") {
        const progress = 1 - (secondsLeft / phaseDurationNum);
        setCircleScale(1.5 - (0.5 * progress));
      }
    } else {
      // Current phase completed
      if (phaseIndex < currentPattern.length - 1) {
        // Move to next phase in current exercise
        setPhaseIndex(phaseIndex + 1);
        setPreCountdown(3);
        setSecondsLeft(3);
        speak("Next phase starting soon");
      } else {
        // Move to next exercise after a break
        setIsBetween(true);
        setSecondsLeft(5);
        speak("Exercise completed. Next exercise starting in 5 seconds.");
      }
    }
  }, [
    isBetween, currentExercise, preCountdown, phaseName, 
    secondsLeft, phaseIndex, currentPattern, speak, playSound, phaseDurationNum
  ]);

  // Main timer effect
  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      window.speechSynthesis.cancel();
      return;
    }

    if (intervalRef.current) clearInterval(intervalRef.current);
    
    intervalRef.current = setInterval(() => {
      nextStep();
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isRunning, nextStep]);

  // Announce current phase when it changes
  useEffect(() => {
    if (isRunning && preCountdown === 0 && secondsLeft === phaseDurationNum && !isBetween) {
      speak(`${phaseName} for ${phaseDurationNum} seconds`);
    }
  }, [phaseName, phaseDurationNum, speak, isRunning, preCountdown, secondsLeft, isBetween]);

  const handleStartPause = () => {
    if (!isRunning) {
      // When starting, initialize the first phase
      if (secondsLeft === 0) {
        setSecondsLeft(isBetween ? 5 : phaseDurationNum);
      }
      setIsRunning(true);
      speak("Starting breathing exercise");
    } else {
      setIsRunning(false);
      speak("Paused");
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBetween(false);
    setCurrentExercise(0);
    setPhaseIndex(0);
    setSecondsLeft(parseInt(exercises[0].pattern[0].split(":")[1]));
    setCircleScale(1);
    setPreCountdown(0);
    window.speechSynthesis.cancel();
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    speak("Reset breathing exercise");
  };

  const handleNextExercise = () => {
    if (!isRunning) {
      const nextExercise = (currentExercise + 1) % exercises.length;
      setCurrentExercise(nextExercise);
      setPhaseIndex(0);
      setSecondsLeft(parseInt(exercises[nextExercise].pattern[0].split(":")[1]));
      setCircleScale(1);
      setPreCountdown(0);
      setIsBetween(false);
      speak(`Selected ${exercises[nextExercise].name}`);
    }
  };

  const handlePreviousExercise = () => {
    if (!isRunning) {
      const prevExercise = currentExercise === 0 ? exercises.length - 1 : currentExercise - 1;
      setCurrentExercise(prevExercise);
      setPhaseIndex(0);
      setSecondsLeft(parseInt(exercises[prevExercise].pattern[0].split(":")[1]));
      setCircleScale(1);
      setPreCountdown(0);
      setIsBetween(false);
      speak(`Selected ${exercises[prevExercise].name}`);
    }
  };

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(1);
    speak("Welcome to the breathing exercise tutorial. This app helps you practice different breathing techniques. Use the next and previous buttons to navigate between exercises. Press the start button to begin an exercise. Press the settings button to customize voice options.");
  };

  const nextTutorialStep = () => {
    if (tutorialStep < 4) {
      setTutorialStep(tutorialStep + 1);
      
      if (tutorialStep === 1) {
        speak("During exercises, follow the circle animation. It expands when you inhale and contracts when you exhale. The progress circle shows the time remaining for each phase.");
      } else if (tutorialStep === 2) {
        speak("For better visibility, enable high contrast mode in settings. You can also adjust the voice speed and volume to your preference.");
      } else if (tutorialStep === 3) {
        speak("Take your time with each exercise and focus on your breathing. The goal is to relax and reduce stress.");
      }
    } else {
      setShowTutorial(false);
      speak("Tutorial completed. Enjoy your breathing exercises!");
    }
  };

  const formatTime = (s) => `${s.toString().padStart(2, "0")}`;
  
  // Calculate progress percentage for the circle visualization
  let progressPercent = 0;
  if (isBetween) {
    progressPercent = 100 - (secondsLeft / 5) * 100;
  } else if (preCountdown > 0) {
    progressPercent = 100 - (preCountdown / 3) * 100;
  } else {
    progressPercent = 100 - (secondsLeft / phaseDurationNum) * 100;
  }

  // Apply high contrast styles if enabled
  const bgColor = highContrast 
    ? "bg-gradient-to-b from-gray-900 to-black" 
    : "bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900";
  
  const circleColor = highContrast ? "stroke-yellow-400" : "stroke-white";
  const buttonBg = highContrast ? "bg-yellow-600" : "bg-purple-600";
  const buttonHover = highContrast ? "hover:bg-yellow-700" : "hover:bg-purple-700";
  const resetBg = highContrast ? "bg-red-700" : "bg-red-600";
  const resetHover = highContrast ? "hover:bg-red-800" : "hover:bg-red-700";

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen text-white pt-20 pb-10 px-4 ${bgColor} relative`}>
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-700 rounded-full mix-blend-soft-light filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-24 left-4 flex items-center text-purple-200 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <audio ref={audioRef} />
      <h1 className="text-3xl font-bold mb-4 text-center z-10">Breathing Exercises</h1>
      
      {/* Settings Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 w-full max-w-md border border-white/20 z-10">
        <h2 className="text-xl font-semibold mb-2 flex items-center">
          <Sun className="mr-2 h-5 w-5" />
          Accessibility Settings
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 flex items-center">
              <Volume2 className="mr-1 h-4 w-4" />
              Voice Speed: {voiceRate.toFixed(1)}
            </label>
            <input 
              type="range" 
              min="0.5" 
              max="1.5" 
              step="0.1" 
              value={voiceRate} 
              onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block mb-1">Voice Volume: {voiceVolume.toFixed(1)}</label>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              value={voiceVolume} 
              onChange={(e) => setVoiceVolume(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center col-span-2">
            <input 
              type="checkbox" 
              id="highContrast" 
              checked={highContrast} 
              onChange={(e) => setHighContrast(e.target.checked)}
              className="mr-2 h-5 w-5"
            />
            <label htmlFor="highContrast">High Contrast Mode</label>
          </div>
        </div>
      </div>
      
      {/* Main Exercise Panel */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 w-full max-w-md text-center shadow-lg border border-white/20 z-10">
        <h2 className="text-2xl font-semibold mb-2">{exercises[currentExercise].name}</h2>
        
        {isBetween ? (
          <p className="text-lg mb-2">Next exercise in: {secondsLeft}s</p>
        ) : preCountdown > 0 ? (
          <p className="text-lg mb-2">{phaseName.toUpperCase()} starting in: {preCountdown}s</p>
        ) : (
          <p className="text-lg mb-2">
            Phase: {phaseName.toUpperCase()} ({secondsLeft}s)
          </p>
        )}
        
        <div className="relative mx-auto w-48 h-48 mb-4">
          <svg className="w-full h-full rotate-[-90deg]">
            <circle cx="96" cy="96" r="84" className={circleColor} strokeWidth="8" fill="transparent" opacity="0.2" />
            <circle
              cx="96" cy="96"
              r="84"
              className={circleColor}
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 84}
              strokeDashoffset={(2 * Math.PI * 84 * (100 - progressPercent)) / 100}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear" }}
            />
          </svg>
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white/50 bg-white/20"
            style={{ 
              width: `${circleScale * 144}px`, 
              height: `${circleScale * 144}px`, 
              transition: "all 1s ease-in-out" 
            }}
          />
        </div>
        
        <p className="mt-2 text-lg mb-4">
          {isBetween ? "Break" : preCountdown > 0 ? "Get Ready" : phaseName.toUpperCase()}: {formatTime(isBetween ? secondsLeft : preCountdown > 0 ? preCountdown : secondsLeft)}s
        </p>
        
        <div className="flex justify-center gap-2 mb-4">
          <button 
            onClick={handlePreviousExercise} 
            disabled={isRunning}
            className={`px-4 py-3 rounded-lg ${buttonBg} ${buttonHover} disabled:opacity-50 text-lg min-w-[50px]`}
            aria-label="Previous exercise"
          >
            ←
          </button>
          <button 
            onClick={handleStartPause} 
            className={`px-6 py-3 rounded-lg ${buttonBg} ${buttonHover} flex-grow text-lg flex items-center justify-center`}
          >
            {isRunning ? <Pause className="mr-1 h-5 w-5" /> : <Play className="mr-1 h-5 w-5" />}
            {isRunning ? "Pause" : "Start"}
          </button>
          <button 
            onClick={handleNextExercise} 
            disabled={isRunning}
            className={`px-4 py-3 rounded-lg ${buttonBg} ${buttonHover} disabled:opacity-50 text-lg min-w-[50px]`}
            aria-label="Next exercise"
          >
            →
          </button>
        </div>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={handleReset} 
            className={`px-4 py-3 rounded-lg ${resetBg} ${resetHover} text-lg flex items-center justify-center`}
          >
            <RotateCcw className="mr-1 h-5 w-5" />
            Reset
          </button>
          <button 
            onClick={showTutorial ? nextTutorialStep : startTutorial}
            className={`px-4 py-3 rounded-lg ${buttonBg} ${buttonHover} text-lg flex items-center justify-center`}
          >
            <Info className="mr-1 h-5 w-5" />
            {showTutorial ? (tutorialStep < 4 ? "Next Tip" : "Finish Tutorial") : "Tutorial"}
          </button>
        </div>
      </div>
      
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white text-black rounded-xl p-6 max-w-md">
            <h3 className="text-2xl font-bold mb-4">Tutorial</h3>
            {tutorialStep === 1 && (
              <p>Welcome! This app helps you practice breathing exercises. Navigate between exercises using the arrow buttons.</p>
            )}
            {tutorialStep === 2 && (
              <p>Watch the circle animation - it expands when you inhale and contracts when you exhale. The progress circle shows time remaining.</p>
            )}
            {tutorialStep === 3 && (
              <p>Adjust voice settings to your preference in the settings panel for the best experience.</p>
            )}
            {tutorialStep === 4 && (
              <p>Use high contrast mode for better visibility. Take your time and enjoy the calming breathing exercises!</p>
            )}
            <button 
              onClick={nextTutorialStep}
              className={`mt-4 px-4 py-2 rounded-lg ${buttonBg} ${buttonHover} text-white`}
            >
              {tutorialStep < 4 ? "Next" : "Get Started"}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center z-10">
        <p className="text-sm opacity-80">
          Designed for accessibility with voice guidance and visual cues.
        </p>
      </div>
    </div>
  );
}