import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center py-3 space-x-2">
          {/* Logo / Emblem */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-purple-700/80 transition-all hover:bg-purple-600/80 hover:scale-110 animate-pulse">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-white select-none">
              Seeing Beyond AI
            </h1>
          </Link>
        </div>
      </div>
    </nav>
  );
}
