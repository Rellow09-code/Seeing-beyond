import React, { useEffect } from 'react';

export default function BlindPage() {
  useEffect(() => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.start();

    recognition.onresult = async (event) => {
      const command = event.results[event.results.length - 1][0].transcript.toLowerCase();
      if (command.includes("open camera")) {
        alert("Camera opening... (mock)");
      } else if (command.includes("read text")) {
        alert("Reading text... (mock)");
      } else if (command.includes("help")) {
        const helpMsg = new SpeechSynthesisUtterance("Commands: Open Camera, Read Text, Help");
        speechSynthesis.speak(helpMsg);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-700 to-purple-400 text-white p-4 text-center">
      <h2 className="text-4xl font-bold mb-4">Blind Mode Activated</h2>
      <p className="text-lg md:text-xl">
        Voice commands enabled. Say <span className="font-semibold">'Help'</span> for guidance.
      </p>
    </div>
  );
}
