import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ImageUpload from "./pages/Imageupload.jsx";
import ImagePredictor from "./pages/scene.jsx"; // import the default component with the correct name

export default function App() {
  return (
    <Router>
      <nav style={{ marginBottom: "20px" }}>
        <Link to="/upload" style={{ marginRight: "10px" }}>Upload</Link>
        <Link to="/scene">Scene Predictor</Link>
      </nav>

      <Routes>
        <Route path="/upload" element={<ImageUpload />} />
        <Route path="/scene" element={<ImagePredictor />} />
      </Routes>
    </Router>
  );
}
