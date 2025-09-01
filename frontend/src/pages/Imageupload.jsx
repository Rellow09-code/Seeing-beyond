import React, { useState } from 'react';
import axios from 'axios';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setPrediction("");
    setError("");

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post("http://127.0.0.1:5000/predict", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(res.data.prediction);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "2rem" }}>
      <h1>Vision Prediction</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={!file} style={{ marginLeft: "1rem" }}>
          Predict
        </button>
      </form>

      {prediction && (
        <h2 style={{ marginTop: "1rem", color: "green" }}>
          Prediction: {prediction}
        </h2>
      )}

      {error && (
        <h2 style={{ marginTop: "1rem", color: "red" }}>
          Error: {error}
        </h2>
      )}
    </div>
  );
}

export default ImageUpload;
