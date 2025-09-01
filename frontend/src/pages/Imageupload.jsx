import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';

function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError("");
      setPrediction("");
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
        setError("");
        setPrediction("");
      } else {
        setError("Please select an image file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm dark:bg-slate-900/80">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent dark:from-slate-100 dark:to-slate-400">
              Vision Prediction
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Upload an image to get AI-powered predictions
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* File Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive 
                  ? 'border-slate-400 bg-slate-50 dark:bg-slate-800' 
                  : 'border-slate-300 hover:border-slate-400 dark:border-slate-600 dark:hover:border-slate-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {!preview ? (
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                      Drop your image here
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      or click to browse files
                    </p>
                  </div>
                  <Button 
                    onClick={handleBrowseClick}
                    variant="outline"
                    className="mt-4"
                  >
                    Choose File
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative mx-auto w-48 h-48">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full h-full object-cover rounded-lg shadow-lg"
                    />
                    <button
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setPrediction("");
                        setError("");
                      }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {file?.name}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center">
              <Button 
                onClick={handleSubmit} 
                disabled={!file || loading}
                className="w-full max-w-xs"
                size="lg"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Get Prediction"
                )}
              </Button>
            </div>

            {/* Results */}
            {prediction && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">
                    Prediction Result
                  </h3>
                </div>
                <p className="mt-2 text-green-800 dark:text-green-200">
                  {prediction}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Error
                  </h3>
                </div>
                <p className="mt-2 text-red-800 dark:text-red-200">
                  {error}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default ImageUpload;
