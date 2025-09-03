import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, History, Sun, Moon, ArrowLeft, BookOpen, Grid, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SignLanguageDictionary() {
  const [query, setQuery] = useState("");
  const [gif, setGif] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [activeTab, setActiveTab] = useState("asl");
  const [colorMode, setColorMode] = useState("dark");
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();

  // Common words for quick access
  const commonWords = [
    "Hello", "Thank you", "Please", "Sorry", "Help", 
    "Water", "Food", "Home", "Love", "Happy", "Yes", "No"
  ];

  // Categories for easier navigation
  const wordCategories = {
    "Greetings": ["Hello", "Goodbye", "Good morning", "How are you", "Nice to meet you"],
    "Basics": ["Please", "Thank you", "Sorry", "Yes", "No", "Help"],
    "Needs": ["Water", "Food", "Home", "Bathroom", "Sleep", "Medicine"],
    "Emotions": ["Happy", "Sad", "Angry", "Love", "Excited", "Tired"]
  };

  // Color themes
  const themes = {
    dark: {
      bg: "bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900",
      card: "bg-white/10 backdrop-blur-md border border-white/20",
      text: "text-white",
      accent: "text-purple-200",
      button: "bg-purple-600 hover:bg-purple-700 text-white",
      input: "bg-white/10 text-white placeholder-purple-200 border-purple-500",
      header: "text-white",
      footer: "text-purple-200 border-purple-800"
    },
    light: {
      bg: "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100",
      card: "bg-white/90 backdrop-blur-sm border border-gray-200",
      text: "text-gray-900",
      accent: "text-purple-600",
      button: "bg-purple-500 hover:bg-purple-600 text-white",
      input: "bg-white text-gray-900 placeholder-gray-500 border-purple-400",
      header: "text-gray-900",
      footer: "text-gray-600 border-gray-300"
    }
  };

  const theme = themes[colorMode];

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem("seeingBeyondRecentSearches");
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    // Set initial color mode based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      setColorMode("light");
    }
  }, []);

  // Save recent searches to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("seeingBeyondRecentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const handleSearch = async (searchTerm = query) => {
    if (!searchTerm.trim()) return;

    const term = searchTerm.trim();
    setQuery(term);
    setLoading(true);
    setError("");
    setGif(null);

    try {
      // Add to recent searches (avoid duplicates)
      setRecentSearches(prev => {
        const filtered = prev.filter(item => item !== term);
        return [term, ...filtered].slice(0, 5); // Keep only 5 most recent
      });

      // GIPHY GIF
      const gifRes = await axios.get("https://api.giphy.com/v1/gifs/search", {
        params: {
          api_key: import.meta.env.VITE_GIPHY_API_KEY || "3P5pWr1M2HZ0cZk0T9zYV7Zk0T9zYV7",
          q: `${term} ASL sign language`,
          limit: 1,
          rating: "g" // Keep it family-friendly
        },
      });
      
      if (gifRes.data.data.length > 0) {
        setGif(gifRes.data.data[0]);
      }
    } catch (err) {
      console.error("Error fetching GIF:", err);
      // We don't set error state for GIF failures since we have SpreadTheSign
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearHistory = () => {
    setRecentSearches([]);
  };

  const toggleColorMode = () => {
    setColorMode(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} pt-20 pb-10 px-4 flex flex-col items-center transition-colors duration-300 relative`}>
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

      <div className="w-full max-w-6xl z-10">
        {/* Header */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
            Sign Language Dictionary
          </h1>
          <p className={`${theme.accent} text-lg`}>Breaking communication barriers with Seeing Beyond</p>
        </header>

        {/* Search Section */}
        <div className={`${theme.card} rounded-2xl p-6 shadow-lg mb-8`}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center">
              <Search className="mr-2 h-5 w-5" />
              Search for a Sign
            </h2>
            <button
              onClick={toggleColorMode}
              className={`px-4 py-2 rounded-lg ${theme.button} transition-colors flex items-center`}
            >
              {colorMode === "dark" ? (
                <>
                  <Sun size={16} className="mr-1" />
                  Light Mode
                </>
              ) : (
                <>
                  <Moon size={16} className="mr-1" />
                  Dark Mode
                </>
              )}
            </button>
          </div>
          
          <div className="flex mb-6">
            <div className="relative flex-grow mr-2">
              <input
                type="text"
                placeholder="Enter a word or phrase..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className={`border-2 rounded-l-xl px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-purple-400 ${theme.input}`}
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3 top-3 text-gray-500 hover:text-white"
                >
                  <X size={18} />
                </button>
              )}
            </div>
            <button
              onClick={() => handleSearch()}
              disabled={loading || !query.trim()}
              className={`px-5 py-3 rounded-r-xl font-bold transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${theme.button}`}
            >
              {loading ? "..." : "Search"}
            </button>
          </div>

          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowCategories(!showCategories)}
              className={`${theme.accent} hover:underline text-sm flex items-center`}
            >
              <Grid size={16} className="mr-1" />
              {showCategories ? "Hide" : "Show"} Categories
            </button>
            
            {recentSearches.length > 0 && (
              <button
                onClick={clearHistory}
                className="text-red-400 hover:text-red-300 text-sm flex items-center"
              >
                <History size={16} className="mr-1" />
                Clear History
              </button>
            )}
          </div>

          {showCategories && (
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Categories</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(wordCategories).map(([category, words]) => (
                  <div key={category} className={`${theme.card} p-4 rounded-lg`}>
                    <h4 className="font-medium mb-3 text-lg">{category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {words.map((word, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(word)}
                          className="px-3 py-1.5 rounded-lg text-sm bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recentSearches.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold mb-2 flex items-center">
                <History size={18} className="mr-2" />
                Recent Searches
              </h3>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="px-3 py-1.5 rounded-lg text-sm bg-purple-900 bg-opacity-50 text-purple-200 hover:bg-purple-800 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-2 flex items-center">
              <BookOpen size={18} className="mr-2" />
              Quick Access
            </h3>
            <div className="flex flex-wrap gap-2">
              {commonWords.map((word, index) => (
                <button
                  key={index}
                  onClick={() => handleSearch(word)}
                  className="px-3 py-1.5 rounded-lg text-sm bg-purple-700 text-white hover:bg-purple-600 transition-colors"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {loading && (
          <div className={`${theme.card} rounded-2xl p-8 mb-8 flex flex-col items-center`}>
            <div className="animate-pulse flex flex-col items-center">
              <div className="rounded-full bg-purple-600 h-16 w-16 mb-4"></div>
              <div className="h-4 bg-purple-600 rounded w-40 mb-2"></div>
              <div className="h-4 bg-purple-600 rounded w-56"></div>
            </div>
            <p className={`mt-6 ${theme.accent}`}>Searching for sign language resources...</p>
          </div>
        )}

        {query && !loading && (
          <div className={`${theme.card} rounded-2xl shadow-lg overflow-hidden mb-8 transition-all duration-300`}>
            <div className="border-b border-white/20">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab("asl")}
                  className={`py-4 px-6 text-center font-medium flex-1 ${activeTab === "asl" ? "bg-purple-900 bg-opacity-50 font-semibold" : "hover:bg-white/5"}`}
                >
                  ASL Video
                </button>
                <button
                  onClick={() => setActiveTab("gif")}
                  className={`py-4 px-6 text-center font-medium flex-1 ${activeTab === "gif" ? "bg-purple-900 bg-opacity-50 font-semibold" : "hover:bg-white/5"}`}
                >
                  GIF Demonstration
                </button>
              </nav>
            </div>

            <div className="p-1">
              <div className="flex justify-between items-center mb-4 px-4 pt-4">
                <h2 className="text-xl font-semibold">Sign for "{query}"</h2>
              </div>

              {activeTab === "asl" && (
                <div className="bg-black bg-opacity-90 rounded-xl overflow-hidden mx-4 mb-6 h-96">
                  <iframe
                    src={`https://www.spreadthesign.com/en.us/search/?q=${encodeURIComponent(query)}`}
                    width="100%"
                    height="100%"
                    className="border-0"
                    title={`ASL video for ${query}`}
                    loading="eager"
                  />
                </div>
              )}
              
              {activeTab === "gif" && gif && (
                <div className="flex flex-col items-center justify-center p-4">
                  <div className="bg-black bg-opacity-20 rounded-lg p-4 w-full max-w-md">
                    <img
                      src={gif.images.fixed_height.url}
                      alt={gif.title}
                      className="w-full h-64 object-contain rounded shadow-md"
                    />
                    <p className="text-center text-gray-400 mt-2 text-sm">{gif.title}</p>
                  </div>
                </div>
              )}

              {activeTab === "gif" && !gif && (
                <div className="text-center p-8">
                  <p className={`${theme.accent} mb-4`}>No GIF demonstration available for "{query}"</p>
                  <p className="text-gray-400">Try the ASL Video tab for reliable sign language demonstrations</p>
                </div>
              )}
            </div>
          </div>
        )}

        {!query && !loading && (
          <div className={`${theme.card} rounded-2xl p-8 flex flex-col items-center justify-center text-center mb-8`}>
            <div className="mb-6">
              <div className="text-5xl mb-2">👋</div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Sign Language Dictionary</h2>
              <p className={theme.accent}>Search for any word to see its sign language demonstration</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
              <div className="bg-purple-900 bg-opacity-50 p-4 rounded-xl">
                <div className="text-3xl mb-2">🎥</div>
                <h3 className="font-semibold">ASL Videos</h3>
                <p className="text-purple-200 text-sm">Embedded from SpreadTheSign</p>
              </div>
              <div className="bg-indigo-900 bg-opacity-50 p-4 rounded-xl">
                <div className="text-3xl mb-2">🔄</div>
                <h3 className="font-semibold">GIF Demos</h3>
                <p className="text-indigo-200 text-sm">Visual demonstrations</p>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-8 text-center text-sm">
          <div className={`border-t ${theme.footer} pt-6`}>
            <p>Seeing Beyond - Breaking communication barriers</p>
            <p className="mt-2">© {new Date().getFullYear()} - All rights reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
}