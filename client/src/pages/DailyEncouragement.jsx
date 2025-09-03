import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { RefreshCw, Heart, Users, MessageCircle, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fallbackMessages = [
  "You are stronger than you think.",
  "Every day is a chance to grow.",
  "Your voice matters, even in silence.",
  "Keep shining, the world needs your light.",
  "You are not alone on this journey.",
  "Small steps lead to big changes.",
  "Your presence makes a difference.",
  "Believe in yourself, always.",
  "Even the darkest night will end and the sun will rise.",
  "You've survived 100% of your bad days so far.",
  "Progress, not perfection, is what matters.",
  "You are enough just as you are.",
];

export default function DailyEncouragement() {
  const { user, token } = useAuth();
  const [message, setMessage] = useState("");
  const [gif, setGif] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quoteAuthor, setQuoteAuthor] = useState("");
  const [stories, setStories] = useState([]);
  const [newStory, setNewStory] = useState("");
  const [posting, setPosting] = useState(false);
  const navigate = useNavigate();

  // Fetch quote from multiple API options with fallbacks
  const fetchQuote = async () => {
    try {
      // Try QuoteGarden API first
      try {
        const res = await axios.get("https://quote-garden.onrender.com/api/v3/quotes/random");
        if (res.data && res.data.data && res.data.data.length > 0) {
          setMessage(res.data.data[0].quoteText);
          setQuoteAuthor(res.data.data[0].quoteAuthor || "Unknown");
          return true;
        }
      } catch (e) {
        console.log("QuoteGarden API failed, trying alternatives");
      }

      // Try ZenQuotes as second option
      try {
        const res = await axios.get("https://zenquotes.io/api/random");
        if (res.data && res.data[0] && res.data[0].q) {
          setMessage(res.data[0].q);
          setQuoteAuthor(res.data[0].a || "Unknown");
          return true;
        }
      } catch (e) {
        console.log("ZenQuotes API failed, trying alternatives");
      }

      // Try Quotable as third option
      try {
        const res = await axios.get("https://api.quotable.io/random");
        if (res.data && res.data.content) {
          setMessage(res.data.content);
          setQuoteAuthor(res.data.author || "Unknown");
          return true;
        }
      } catch (e) {
        console.log("Quotable API failed");
      }

      // Fallback to local messages if all APIs fail
      const randomMsg = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      setMessage(randomMsg);
      setQuoteAuthor("Seeing Beyond Team");
      return true;
    } catch (err) {
      console.error("Error fetching quote:", err);
      const randomMsg = fallbackMessages[Math.floor(Math.random() * fallbackMessages.length)];
      setMessage(randomMsg);
      setQuoteAuthor("Seeing Beyond Team");
      return false;
    }
  };

  // Fetch gif from GIPHY or use fallback
  const fetchGif = async () => {
    try {
      // Use a default API key if environment variable is not available
      const apiKey = import.meta.env.VITE_GIPHY_API_KEY || "3P5pWr1M2HZ0cZk0T9zYV7Zk0T9zYV7";
      
      const gifRes = await axios.get("https://api.giphy.com/v1/gifs/random", {
        params: {
          api_key: apiKey,
          tag: "inspiration motivational",
          rating: "g",
        },
      });
      
      if (gifRes.data.data) {
        setGif(gifRes.data.data);
        return true;
      }
    } catch (err) {
      console.error("Error fetching GIF:", err);
    }
    
    // Use fallback image if GIPHY fails
    setGif({
      images: {
        fixed_height: {
          url: "https://source.unsplash.com/400x300/?inspiration,motivation,hope"
        }
      },
      title: "Inspiration"
    });
    return false;
  };

  // Fetch quote + gif
  const fetchEncouragement = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchQuote(), fetchGif()]);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stories
  const fetchStories = async () => {
    if (!token) return;
    
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_SERVER_URL}/api/stories`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStories(res.data);
    } catch (err) {
      console.error("Failed to load stories:", err);
    }
  };

  // Post new story
  const handlePostStory = async (e) => {
    e.preventDefault();
    if (!newStory.trim() || !token) return;

    setPosting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/api/stories`,
        {
          name: user?.username || "Anonymous",
          message: newStory,
          userId: user?._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewStory("");
      fetchStories(); // reload stories
    } catch (err) {
      console.error("Failed to post story:", err);
      alert("Failed to post your story. Please try again.");
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    fetchEncouragement();
    if (token) {
      fetchStories();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex flex-col items-center justify-start pt-20 pb-10 px-4 relative">
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

      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-2xl w-full text-center mb-10 border border-white/20 shadow-xl z-10">
        <h1 className="text-3xl font-bold text-white mb-4">
          🌟 Daily Encouragement 🌟
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <RefreshCw className="h-8 w-8 text-purple-300 animate-spin mb-4" />
            <p className="text-purple-200">Loading your daily inspiration...</p>
          </div>
        ) : (
          <>
            <div className="relative bg-white/10 p-6 rounded-xl mb-6 border border-white/20">
              <Heart className="absolute -top-3 -left-3 h-6 w-6 text-pink-400" />
              <p className="text-xl font-medium text-white italic mb-2">"{message}"</p>
              <p className="text-sm text-purple-200">— {quoteAuthor}</p>
            </div>
            
            <div className="mb-6 rounded-xl overflow-hidden shadow-md mx-auto max-w-md border-2 border-white/30">
              {gif ? (
                <img
                  src={gif.images.fixed_height.url}
                  alt={gif.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <img
                  src="https://source.unsplash.com/400x300/?inspiration,hope,motivation"
                  alt="Encouragement"
                  className="w-full h-64 object-cover"
                />
              )}
            </div>
          </>
        )}

        <button
          onClick={fetchEncouragement}
          disabled={loading}
          className="mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md flex items-center justify-center mx-auto disabled:opacity-50"
        >
          <RefreshCw size={18} className="mr-2" />
          New Inspiration
        </button>
      </div>

      {/* Story Form */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full mb-6 border border-white/20 shadow-xl z-10">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <MessageCircle className="mr-2 h-6 w-6 text-purple-300" />
          Share Your Story
        </h2>
        <form onSubmit={handlePostStory} className="flex flex-col gap-4">
          <textarea
            value={newStory}
            onChange={(e) => setNewStory(e.target.value)}
            placeholder="Write how you're feeling today or share something encouraging..."
            rows={3}
            className="w-full p-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={posting}
          />
          <button
            type="submit"
            disabled={posting || !newStory.trim() || !token}
            className="self-end px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {posting ? "Posting..." : "Post Story"}
          </button>
        </form>
        
        {!token && (
          <p className="text-sm text-purple-200 mt-4">
            Please log in to share your story with the community.
          </p>
        )}
      </div>

      {/* Story List */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl w-full border border-white/20 shadow-xl z-10">
        <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
          <Users className="mr-2 h-6 w-6 text-purple-300" />
          Community Stories
        </h2>
        {stories.length === 0 ? (
          <p className="text-purple-200 text-center py-4">
            {token ? "No stories yet. Be the first to share!" : "Log in to view community stories."}
          </p>
        ) : (
          <ul className="space-y-4">
            {stories.map((story) => (
              <li
                key={story._id}
                className="bg-white/5 p-4 rounded-lg border border-white/20"
              >
                <p className="font-semibold text-purple-300">{story.name}</p>
                <p className="text-white mt-2">{story.message}</p>
                <p className="text-xs text-purple-200 mt-2">
                  {new Date(story.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}