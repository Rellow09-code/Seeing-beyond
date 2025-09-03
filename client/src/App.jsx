import { Routes, Route, Navigate, useLocation } from "react-router-dom"; 
import Login from "./pages/Login"; 
import Register from "./pages/Register"; 
import Chat from "./pages/Chat"; 

// New pages
import LandingPage from "./pages/LandingPage"; 
import DeafPage from "./pages/DeafPage"; 
import BlindPage from "./pages/BlindPage"; 
import BreathingExercises from "./pages/BreathingExercises"; 
import SignLanguage from "./pages/SignLanguage"; 
import DailyEncouragement from "./pages/DailyEncouragement"; 

// Contexts
import { AuthProvider, useAuth } from "./context/AuthContext"; 
import { ChatProvider } from "./context/ChatContext"; 
import { SocketProvider } from "./context/SocketContext"; 
import WebRtcContextProvider from "./context/WebRtcContext"; 

// Route guards
import PrivateRoute from "./components/PrivateRoute"; 
import PublicRoute from "./components/PublicRoute"; 
import Navbar from "./components/Navbar"; 

function App() { 
  const { token, user } = useAuth(); 
  const location = useLocation(); 

  // Don't show Navbar on the Chat page
  const showNavbar = location.pathname !== "/chat";

  return ( 
    <div className="App"> 
      {showNavbar && <Navbar />} {/* Navbar visible everywhere except /chat */} 
      <Routes> 
        {/* Landing page as new root */} 
        <Route path="/" element={<LandingPage />} /> 

        {/* Deaf / Blind pages */} 
        <Route path="/deaf" element={<DeafPage />} /> 
        <Route path="/blind" element={<BlindPage />} /> 

        <Route path="/breathing-exercises" element={<BreathingExercises />} /> 
        <Route path="/sign-language" element={<SignLanguage />} /> 
        <Route path="/daily-encouragement" element={ 
          <PrivateRoute> 
            <DailyEncouragement /> 
          </PrivateRoute> 
        } /> 

        {/* Registration / Login */} 
        <Route path="/login" element={ 
          <PublicRoute> 
            <Login /> 
          </PublicRoute> 
        } /> 
        <Route path="/register" element={ 
          <PublicRoute> 
            <Register /> 
          </PublicRoute> 
        } /> 

        {/* Chat page */} 
        <Route path="/chat" element={ 
          <PrivateRoute> 
            <SocketProvider> 
              <ChatProvider> 
                <WebRtcContextProvider> 
                  <Chat /> 
                </WebRtcContextProvider> 
              </ChatProvider> 
            </SocketProvider> 
          </PrivateRoute> 
        } /> 

        {/* Redirect unknown routes to LandingPage */} 
        <Route path="*" element={<Navigate to="/" />} /> 
      </Routes> 
    </div> 
  ); 
} 

export default App;
