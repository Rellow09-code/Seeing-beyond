import React, { useEffect, useRef, useState } from "react";

export default function BlindPage() {
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [hasCameraSupport, setHasCameraSupport] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Blind Mode Activated");
  const [subStatus, setSubStatus] = useState("Tap anywhere to start voice mode");
  const [processing, setProcessing] = useState(false);

  // Check if the browser supports camera access
  useEffect(() => {
    const checkCameraSupport = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraSupport(false);
        speak("Camera not supported in this browser. You can still upload images.");
      }
    };
    checkCameraSupport();
  }, []);

  // Cleanup function
  const cleanup = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    speechSynthesis.cancel();
    setIsListening(false);
    setProcessing(false);
    
    // Stop camera if active
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Speak function with queue management
  const speak = (text, priority = false) => {
    if (priority) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => {
      // Restart listening after speaking if we're in listening mode
      if (isListening && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.log("Recognition already started");
        }
      }
    };
    
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // Speak instructions right away
    speak("Blind mode activated. Tap anywhere on the screen to start voice mode.");

    // Cleanup on unmount
    return cleanup;
  }, []);

  // Start recognition when user taps
  const startRecognition = () => {
    // If already listening, don't start again
    if (isListening || cameraActive || processing) return;
    
    cleanup();

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
      setStatusMessage("Listening...");
      setSubStatus("Say 'Camera', 'Front Camera', or 'Help'");
      speak("Voice mode activated. Say 'Camera' to take a picture, 'Front Camera' for selfie mode, or 'Help' for instructions.", true);
    };

    recognition.onresult = async (event) => {
      const command = event.results[event.results.length - 1][0].transcript
        .trim()
        .toLowerCase();
      console.log("Heard:", command);

      if (command.includes("camera")) {
        speak("Opening rear camera", true);
        openCamera('environment');
      } else if (command.includes("front camera")) {
        speak("Opening front camera", true);
        openCamera('user');
      } else if (command.includes("help")) {
        speak("Commands are: say 'Camera' to take a picture with the rear camera, 'Front Camera' for selfie mode, or say 'Help' to hear this again.", true);
      } else {
        speak(`I heard: ${command}. But I don't understand that command. Say 'Help' for instructions.`);
      }
    };

    recognition.onerror = (event) => {
      console.error("Recognition error:", event.error);
      if (event.error === 'no-speech') {
        speak("I didn't hear anything. Please try again.");
      } else if (event.error === 'audio-capture') {
        speak("I couldn't detect any microphone. Please check your audio settings.");
      } else {
        speak("There was an error with speech recognition. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      if (!cameraActive && !processing) {
        setStatusMessage("Ready to Listen");
        setSubStatus("Tap anywhere to start voice mode");
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
    } catch (e) {
      console.error("Recognition start error:", e);
      speak("Failed to start voice recognition. Please try again.");
    }
  };

  // Open camera with specified facing mode
  const openCamera = async (facingMode) => {
    cleanup();
    setCameraActive(true);
    setStatusMessage("Starting Camera");
    setSubStatus("Please allow camera access if prompted");
    
    if (!hasCameraSupport) {
      speak("Camera not supported. Please upload an image instead.");
      fileInputRef.current?.click();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          // Auto-capture after 3 seconds
          setTimeout(() => {
            captureImage();
          }, 3000);
        };
      }
      
      speak("Camera is ready. I will automatically capture an image in 3 seconds.");
    } catch (error) {
      console.error("Error opening camera:", error);
      speak("Could not access camera. Please check permissions or try uploading an image instead.");
      fileInputRef.current?.click();
      setCameraActive(false);
      setStatusMessage("Camera Error");
      setSubStatus("Cannot access camera. Please check permissions");
    }
  };

  // Capture image from camera
  const captureImage = () => {
    if (!videoRef.current || !videoRef.current.srcObject) return;

    setStatusMessage("Capturing Image");
    setSubStatus("Please hold still");
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      processImage(blob);
    }, 'image/jpeg', 0.8);
  };

  // Handle image selection from file input
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatusMessage("Processing Image");
    setSubStatus("Please wait while we describe your image");
    speak("Processing your image, please wait.");
    processImage(file);
  };

  // Process the image (from camera or file)
  const processImage = async (imageBlob) => {
    setProcessing(true);
    try {
      setStatusMessage("Processing Image");
      setSubStatus("Analyzing content...");
      
      const formData = new FormData();
      formData.append("file", imageBlob, "image.jpg");

      // Try the audio endpoint first
      let response = await fetch(
        "https://orchestra-production.up.railway.app/see-image?format=audio",
        {
          method: "POST",
          body: formData,
        }
      );

      // If audio endpoint fails, try the JSON endpoint as fallback
      if (!response.ok) {
        console.warn("Audio endpoint failed, trying JSON endpoint...");
        response = await fetch(
          "https://orchestra-production.up.railway.app/see-image?format=json",
          {
            method: "POST",
            body: formData,
          }
        );
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`API request failed: ${response.status} ${errorData.detail || ''}`);
        }
        
        // If we got JSON response, use TTS for the description
        const data = await response.json();
        speak(data.text_description || "I see an image but cannot provide details at this time.", true);
        
        setStatusMessage("Processing Complete");
        setSubStatus("Tap anywhere to continue");
        setProcessing(false);
        setCameraActive(false);
        return;
      }

      // If audio endpoint worked, play the audio
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        setStatusMessage("Processing Complete");
        setSubStatus("Tap anywhere to continue");
        speak("Image processing complete. Tap anywhere to continue.");
        setProcessing(false);
        setCameraActive(false);
      };
      
      audio.onerror = () => {
        throw new Error("Audio playback failed");
      };
      
      audio.play();
    } catch (error) {
      console.error("Error describing image:", error);
      setStatusMessage("Service Temporarily Unavailable");
      setSubStatus("Please try again later");
      
      if (error.message.includes("502") || error.message.includes("Storage service error")) {
        speak("The image description service is currently unavailable. Please try again in a few moments.");
      } else {
        speak("Sorry, I could not describe this image. Please try again.");
      }
      
      setProcessing(false);
      setCameraActive(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-700 to-purple-400 text-white p-4 text-center"
      onClick={!cameraActive && !processing ? startRecognition : undefined}
      role="button"
      aria-label="Tap to start voice mode"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ' && !cameraActive && !processing) {
          startRecognition();
        }
      }}
    >
      {!cameraActive && !processing ? (
        <>
          <h2 className="text-4xl font-bold mb-4">{statusMessage}</h2>
          <p className="text-lg md:text-xl mb-6">
            {subStatus}
          </p>
          
          {isListening && (
            <div className="mt-6 flex items-center justify-center">
              <div className="relative">
                <div className="w-6 h-6 bg-red-500 rounded-full animate-ping absolute"></div>
                <div className="w-6 h-6 bg-red-600 rounded-full"></div>
              </div>
              <span className="ml-2">Listening...</span>
            </div>
          )}

          <div className="mt-8 bg-white/20 p-6 rounded-2xl max-w-md">
            <h3 className="text-xl font-semibold mb-4">Voice Commands</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <div className="bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">1</div>
                <p>Say <span className="font-semibold">"Camera"</span> for rear camera</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">2</div>
                <p>Say <span className="font-semibold">"Front Camera"</span> for selfie mode</p>
              </div>
              <div className="flex items-center">
                <div className="bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center mr-3">3</div>
                <p>Say <span className="font-semibold">"Help"</span> for instructions</p>
              </div>
            </div>
          </div>

          {/* Hidden camera input */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </>
      ) : processing ? (
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
            <h2 className="text-2xl font-bold mb-2">{statusMessage}</h2>
            <p className="mb-4">{subStatus}</p>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-auto rounded-lg mb-4"
            style={{ transform: 'scaleX(-1)' }} // Mirror for front camera
          />
          <h2 className="text-2xl font-bold mb-2">{statusMessage}</h2>
          <p className="mb-4">{subStatus}</p>
          <div className="flex justify-center">
            <button 
              onClick={cleanup}
              className="bg-red-500 text-white px-6 py-3 rounded-full font-semibold flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}