import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Ear, Heart, Hand, MessageCircle, ArrowLeft, Mic, MicOff } from 'lucide-react';

export default function DeafPage() {
  const [text, setText] = useState('');
  const [transcribed, setTranscribed] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const navigate = useNavigate();

  // Load available voices
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Try to set a default female voice
      const femaleVoice = availableVoices.find(voice => 
        voice.name.includes('Female') || voice.name.includes('Woman') || 
        voice.name.includes('Zira') || voice.name.includes('Samantha')
      );
      
      // Fallback to a default male voice if no female voice found
      const defaultVoice = femaleVoice || 
        availableVoices.find(voice => 
          voice.name.includes('Male') || voice.name.includes('Man') || 
          voice.name.includes('David') || voice.name.includes('Google UK English Male')
        ) || 
        (availableVoices.length > 0 ? availableVoices[0] : null);
      
      setSelectedVoice(defaultVoice);
    };
    
    loadVoices();
    
    // Chrome loads voices asynchronously
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speakText = () => {
    if (text.trim() === '') return;
    
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const listenSpeech = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert("Your browser doesn't support speech recognition. Please try Chrome.");
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.start();
    setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscribed(transcript);
      setIsListening(false);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
  };

  // Filter voices by gender
  const femaleVoices = voices.filter(voice => 
    voice.name.includes('Female') || voice.name.includes('Woman') || 
    voice.name.includes('Zira') || voice.name.includes('Samantha') ||
    voice.name.includes('Karen') || voice.name.includes('Victoria')
  );
  
  const maleVoices = voices.filter(voice => 
    voice.name.includes('Male') || voice.name.includes('Man') || 
    voice.name.includes('David') || voice.name.includes('Google UK English Male') ||
    voice.name.includes('Daniel') || voice.name.includes('Alex')
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 text-white pt-20 pb-10 px-4 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-700 rounded-full mix-blend-soft-light filter blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl"></div>
      </div>
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-24 left-4 flex items-center text-purple-200 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 md:p-8 w-full max-w-2xl border border-white/20 shadow-xl z-10">
        <div className="flex items-center justify-center mb-6">
          <Ear size={32} className="mr-2" />
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Deaf / Mute Mode
          </h2>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-purple-100">
            Select Voice Type
          </label>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSelectedVoice(femaleVoices[0] || null)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center ${
                selectedVoice && femaleVoices.includes(selectedVoice)
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white/10 text-purple-100 hover:bg-white/20'
              }`}
              disabled={femaleVoices.length === 0}
            >
              {femaleVoices.length > 0 ? (
                <>
                  <span className="mr-2">♀</span>
                  Female Voice
                </>
              ) : (
                "Female Voice (N/A)"
              )}
            </button>
            <button
              onClick={() => setSelectedVoice(maleVoices[0] || null)}
              className={`flex-1 py-3 rounded-lg text-sm font-medium transition flex items-center justify-center ${
                selectedVoice && maleVoices.includes(selectedVoice)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white/10 text-purple-100 hover:bg-white/20'
              }`}
              disabled={maleVoices.length === 0}
            >
              {maleVoices.length > 0 ? (
                <>
                  <span className="mr-2">♂</span>
                  Male Voice
                </>
              ) : (
                "Male Voice (N/A)"
              )}
            </button>
          </div>
          
          {selectedVoice && (
            <div className="text-center text-sm text-purple-200 bg-white/5 p-2 rounded-lg">
              Selected: {selectedVoice.name}
            </div>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="textInput" className="block text-sm font-medium mb-2 text-purple-100">
            Type to speak
          </label>
          <textarea
            id="textInput"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type something here..."
            rows="3"
            className="w-full p-4 rounded-lg text-purple-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-300 resize-none"
          />
        </div>

        <div className="flex gap-4 mb-6 flex-wrap justify-center">
          <button
            onClick={speakText}
            disabled={!text.trim()}
            className="px-6 py-3 rounded-lg bg-white text-purple-800 font-semibold hover:bg-gray-200 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Volume2 size={18} className="mr-2" />
            Speak
          </button>

          <button
            onClick={listenSpeech}
            disabled={isListening}
            className={`px-6 py-3 rounded-lg font-semibold transition flex items-center ${
              isListening 
                ? 'bg-yellow-400 text-purple-800' 
                : 'bg-white text-purple-800 hover:bg-gray-200'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={18} className="mr-2" />
                Listening...
              </>
            ) : (
              <>
                <Mic size={18} className="mr-2" />
                Listen
              </>
            )}
          </button>
        </div>

        {transcribed && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg">
            <p className="text-lg font-medium text-purple-100">Transcribed Text:</p>
            <p className="font-medium text-white mt-2 p-2 bg-white/5 rounded">{transcribed}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-3 rounded-lg bg-yellow-400 text-purple-800 font-bold hover:bg-yellow-300 transition flex items-center justify-center"
          >
            BeyondWords
          </button>

          <button
            onClick={() => navigate('/breathing-exercises')}
            className="px-4 py-3 rounded-lg bg-green-400 text-purple-800 font-bold hover:bg-green-300 transition flex items-center justify-center"
          >
            <Heart size={18} className="mr-2" />
            Breathing
          </button>

          <button
            onClick={() => navigate('/sign-language')}
            className="px-4 py-3 rounded-lg bg-blue-400 text-purple-800 font-bold hover:bg-blue-300 transition flex items-center justify-center"
          >
            <Hand size={18} className="mr-2" />
            Sign Language
          </button>

          <button
            onClick={() => navigate('/daily-encouragement')}
            className="px-4 py-3 rounded-lg bg-indigo-400 text-white font-bold hover:bg-indigo-300 transition flex items-center justify-center"
          >
            <MessageCircle size={18} className="mr-2" />
            Encouragement
          </button>
        </div>
      </div>
    </div>
  );
}