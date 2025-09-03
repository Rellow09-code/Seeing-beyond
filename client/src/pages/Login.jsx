import { useRef, useState } from "react";
import { BsFillChatRightTextFill } from "../assets";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Eye, EyeOff, ArrowLeft, LogIn } from "lucide-react";

export default function Login() {
  const userIdRef = useRef();
  const passwordRef = useRef();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, authError } = useAuth();
  const navigate = useNavigate();

  const formFields = [
    {
      type: "text",
      placeholder: "Enter your email or username",
      ref: userIdRef,
    },
    {
      type: showPassword ? "text" : "password",
      placeholder: "Enter your password",
      ref: passwordRef,
      icon: showPassword ? EyeOff : Eye,
      onIconClick: () => setShowPassword(!showPassword),
    },
  ];

  // handle user login
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const user = {
      userId: userIdRef.current.value,
      password: passwordRef.current.value,
    };

    // login hook
    await login(user);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-4 relative">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
        <div className="absolute top-10 right-10 w-64 h-64 bg-purple-700 rounded-full mix-blend-soft-light filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-indigo-700 rounded-full mix-blend-soft-light filter blur-xl animate-pulse delay-1000"></div>
      </div>
      
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="absolute top-6 left-4 flex items-center text-purple-200 hover:text-white transition-colors z-10"
      >
        <ArrowLeft size={20} className="mr-1" />
        Back
      </button>

      <div className="w-full max-w-md z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl">
          {/* Logo and title */}
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-white p-3 bg-purple-600 rounded-full">
                <BsFillChatRightTextFill className="text-xl" />
              </div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200">
                Seeing Beyond
              </h1>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-xl text-white">Welcome Back</h3>
              <p className="text-purple-200 mt-1">
                Sign in to continue your journey
              </p>
            </div>
          </div>

          {/* Login form */}
          <form onSubmit={handleFormSubmit} className="space-y-5">
            {authError && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-center">
                {authError}
              </div>
            )}
            
            {formFields.map((field, index) => (
              <div key={index} className="relative">
                <input
                  type={field.type}
                  required
                  placeholder={field.placeholder}
                  ref={field.ref}
                  className="w-full p-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                />
                {field.icon && (
                  <button
                    type="button"
                    onClick={field.onIconClick}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-200 hover:text-white"
                  >
                    <field.icon size={20} />
                  </button>
                )}
              </div>
            ))}
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </div>
                ) : (
                  <>
                    <LogIn size={20} className="mr-2" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-white/20 text-center">
            <p className="text-purple-200">
              Don't have an account?{" "}
              <Link
                className="text-white font-semibold hover:underline cursor-pointer"
                to="/register"
              >
                Sign Up
              </Link>
            </p>
            <p className="mt-4 text-sm text-purple-300">
              Created by Black 🖤 Mask 👑 Hackers 👨‍💻🎭
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}