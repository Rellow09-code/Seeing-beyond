import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Eye, Volume2, Ear, Heart, Hand, MessageCircle, User, UserPlus } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Animate max-height dynamically based on content
  useEffect(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.style.maxHeight = open
        ? `${mobileMenuRef.current.scrollHeight}px`
        : "0px";
    }
  }, [open]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`w-full fixed top-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-purple-800/90 shadow-lg" : "bg-purple-700/80"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-white group"
            onClick={() => setOpen(false)}
          >
            <div className="p-2 rounded-lg group-hover:bg-white/20 transition-all">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Seeing Beyond</h1>
          </Link>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" icon={<User size={16} />} active={isActive("/")} onClick={() => setOpen(false)}>Home</NavLink>
            <NavLink to="/deaf" icon={<Ear size={16} />} active={isActive("/deaf")} onClick={() => setOpen(false)}>Deaf Mode</NavLink>
            <NavLink to="/blind" icon={<Volume2 size={16} />} active={isActive("/blind")} onClick={() => setOpen(false)}>Blind Mode</NavLink>
            <NavLink to="/breathing-exercises" icon={<Heart size={16} />} active={isActive("/breathing-exercises")} onClick={() => setOpen(false)}>Breathing</NavLink>
            <NavLink to="/sign-language" icon={<Hand size={16} />} active={isActive("/sign-language")} onClick={() => setOpen(false)}>Sign Language</NavLink>
            <NavLink to="/daily-encouragement" icon={<MessageCircle size={16} />} active={isActive("/daily-encouragement")} onClick={() => setOpen(false)}>Encouragement</NavLink>
            <NavLink to="/chat" icon={<MessageCircle size={16} />} active={isActive("/chat")} onClick={() => setOpen(false)}>Chat</NavLink>
            <div className="mx-2 h-6 w-px bg-white/30"></div>
            <NavLink to="/login" icon={<User size={16} />} active={isActive("/login")} onClick={() => setOpen(false)}>Login</NavLink>
            <NavLink to="/register" icon={<UserPlus size={16} />} active={isActive("/register")} onClick={() => setOpen(false)}>Register</NavLink>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-white hover:text-gray-200 transition-all"
            aria-label="Toggle Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div
          ref={mobileMenuRef}
          className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
        >
          <div className="rounded-lg p-4 mt-2 bg-purple-700/80">
            <div className="grid grid-cols-1 gap-2">
              <MobileNavLink to="/" icon={<User size={18} />} active={isActive("/")} onClick={() => setOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/deaf" icon={<Ear size={18} />} active={isActive("/deaf")} onClick={() => setOpen(false)}>Deaf Mode</MobileNavLink>
              <MobileNavLink to="/blind" icon={<Volume2 size={18} />} active={isActive("/blind")} onClick={() => setOpen(false)}>Blind Mode</MobileNavLink>
              <MobileNavLink to="/breathing-exercises" icon={<Heart size={18} />} active={isActive("/breathing-exercises")} onClick={() => setOpen(false)}>Breathing</MobileNavLink>
              <MobileNavLink to="/sign-language" icon={<Hand size={18} />} active={isActive("/sign-language")} onClick={() => setOpen(false)}>Sign Language</MobileNavLink>
              <MobileNavLink to="/daily-encouragement" icon={<MessageCircle size={18} />} active={isActive("/daily-encouragement")} onClick={() => setOpen(false)}>Encouragement</MobileNavLink>
              <MobileNavLink to="/chat" icon={<MessageCircle size={18} />} active={isActive("/chat")} onClick={() => setOpen(false)}>Chat</MobileNavLink>
              <div className="my-2 h-px bg-white/30"></div>
              <MobileNavLink to="/login" icon={<User size={18} />} active={isActive("/login")} onClick={() => setOpen(false)}>Login</MobileNavLink>
              <MobileNavLink to="/register" icon={<UserPlus size={18} />} active={isActive("/register")} onClick={() => setOpen(false)}>Register</MobileNavLink>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Desktop link
function NavLink({ to, icon, active, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white/20 text-white" : "text-purple-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="opacity-80">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}

// Mobile link
function MobileNavLink({ to, icon, active, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        active ? "bg-white/20 text-white" : "text-purple-100 hover:bg-white/10 hover:text-white"
      }`}
    >
      <span className="opacity-80">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
