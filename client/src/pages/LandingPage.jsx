import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Ear, Heart, Hand, MessageCircle, Users, Eye } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  const startVoiceMode = () => {
    navigate('/blind');
    const utter = new SpeechSynthesisUtterance(
      "Welcome to Seeing Beyond. Say 'Hey Beyond' to start. Say 'Open Camera' to take a picture, or 'Help' for instructions."
    );
    speechSynthesis.speak(utter);
  };

  const features = [
    {
      icon: <Mic className="h-8 w-8" />,
      title: "Voice Mode",
      description: "Voice-controlled assistance for visually impaired users",
      action: () => navigate('/blind'),
      color: "from-purple-600 to-indigo-600"
    },
    {
      icon: <Ear className="h-8 w-8" />,
      title: "Deaf/Mute Mode",
      description: "Visual communication tools for hearing impaired users",
      action: () => navigate('/deaf'),
      color: "from-blue-600 to-cyan-600"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Breathing Exercises",
      description: "Guided breathing techniques for stress relief",
      action: () => navigate('/breathing-exercises'),
      color: "from-green-600 to-emerald-600"
    },
    {
      icon: <Hand className="h-8 w-8" />,
      title: "Sign Language",
      description: "Learn and practice sign language",
      action: () => navigate('/sign-language'),
      color: "from-orange-600 to-amber-600"
    },
    {
      icon: <MessageCircle className="h-8 w-8" />,
      title: "Daily Encouragement",
      description: "Get daily motivational quotes and share stories",
      action: () => navigate('/daily-encouragement'),
      color: "from-pink-600 to-rose-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Community Chat",
      description: "Connect with others in the community",
      action: () => navigate('/chat'),
      color: "from-teal-600 to-cyan-600"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden">
      {/* Enhanced background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        <div className="absolute top-10 left-20 w-72 h-72 bg-purple-700 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl opacity-15 animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-40 w-80 h-80 bg-blue-700 rounded-full mix-blend-soft-light filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-cyan-600 rounded-full mix-blend-soft-light filter blur-xl opacity-10 animate-pulse delay-1500"></div>
      </div>

      {/* Landing page content */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 text-center px-6 z-10 py-12">
        {/* Logo/Icon area */}
        <div className="mb-6 relative">
          <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mx-auto mb-4 border-2 border-white/20 shadow-2xl">
            <Eye className="h-14 w-14 text-white" />
          </div>
          <div className="absolute -inset-3 bg-white/5 rounded-3xl backdrop-blur-sm -z-10"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
          Seeing Beyond
        </h1>
        
        <p className="text-xl md:text-2xl max-w-2xl leading-relaxed text-purple-100">
          Empowering accessibility through AI technology
        </p>

        {/* Main action buttons */}
        <div className="flex flex-col md:flex-row gap-6 mt-8">
          <button
            onClick={startVoiceMode}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Mic className="h-6 w-6" />
            <span className="font-semibold text-lg">Voice Mode</span>
          </button>
          
          <button
            onClick={() => navigate('/deaf')}
            className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 border border-blue-500/30 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <Ear className="h-6 w-6" />
            <span className="font-semibold text-lg">Deaf/Mute Mode</span>
          </button>
        </div>

        {/* Features grid */}
        <div className="mt-16 w-full max-w-6xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Explore Our Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                onClick={feature.action}
                className="group bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 cursor-pointer hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 mx-auto`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                <p className="text-purple-200 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 text-sm text-purple-200 max-w-2xl">
          <p>Seeing Beyond helps people with visual or hearing impairments navigate digital content through voice assistance, visual cues, and accessible communication tools.</p>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-purple-300 z-10 border-t border-white/10 mt-8">
        <p>© {new Date().getFullYear()} Seeing Beyond. Created by Black 🖤 Mask 👑 Hackers 👨‍💻🎭 for the 2025 Wits/Adapt IT Hackathon</p>
      </footer>
    </div>
  );
}