import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Eye, Volume2, Ear, Heart, Hand, MessageCircle, User, UserPlus } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  // Animate max-height for mobile menu
  useEffect(() => {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.style.maxHeight = open
        ? `${mobileMenuRef.current.scrollHeight}px`
        : "0px";
    }
  }, [open]);

  const links = [
    { to: "/", label: "Home", icon: <User /> },
    { to: "/deaf", label: "Deaf Mode", icon: <Ear /> },
    { to: "/blind", label: "Blind Mode", icon: <Volume2 /> },
    { to: "/breathing-exercises", label: "Breathing", icon: <Heart /> },
    { to: "/sign-language", label: "Sign Language", icon: <Hand /> },
    { to: "/daily-encouragement", label: "Encouragement", icon: <MessageCircle /> },
    { to: "/chat", label: "Chat", icon: <MessageCircle /> },
    { to: "/login", label: "Login", icon: <User /> },
    { to: "/register", label: "Register", icon: <UserPlus /> },
  ];

  return (
    <nav className="w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-white group"
            onClick={() => setOpen(false)}
          >
            <div className="p-2 rounded-lg group-hover:bg-white/20 transition-all bg-purple-700/80">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white">Seeing Beyond</h1>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map(({ to, label, icon }, idx) => (
              <NavLink
                key={idx}
                to={to}
                icon={icon}
                active={isActive(to)}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-2 rounded-lg text-white hover:text-gray-200 transition-all"
            aria-label="Toggle Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={mobileMenuRef}
          className="md:hidden overflow-hidden transition-[max-height] duration-300 ease-in-out"
        >
          <div className="rounded-lg p-4 mt-2 bg-purple-700/80">
            <div className="grid grid-cols-1 gap-2">
              {links.map(({ to, label, icon }, idx) => (
                <MobileNavLink
                  key={idx}
                  to={to}
                  icon={icon}
                  active={isActive(to)}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </MobileNavLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Desktop NavLink
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

// Mobile NavLink
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
