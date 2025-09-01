//frontend/src/scene.jsx

import React, { useState, useRef } from "react";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";

export default function ImagePredictor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
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
        setImage(droppedFile);
        setPreview(URL.createObjectURL(droppedFile));
        setPrediction(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!image) return;
    const formData = new FormData();
    formData.append("image", image);

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:5000/predict-scene", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPrediction(res.data.predictions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Scene Recognition
            </CardTitle>
            <CardDescription className="text-lg text-slate-600 dark:text-slate-400">
              Upload an image to identify objects and scenes using AI
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* File Upload Section */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* Upload Area */}
              <div className="space-y-4">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                      : 'border-slate-300 hover:border-indigo-400 dark:border-slate-600 dark:hover:border-indigo-500'
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
                      <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                          Drop your image here
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                          Supports JPG, PNG, GIF up to 10MB
                        </p>
                      </div>
                      <Button 
                        onClick={handleBrowseClick}
                        variant="outline"
                        size="lg"
                        className="mt-4"
                      >
                        Choose Image
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
                            setImage(null);
                            setPreview(null);
                            setPrediction(null);
                          }}
                          className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {image?.name}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <Button 
                    onClick={handleUpload} 
                    disabled={!image || loading}
                    size="lg"
                    className="w-full max-w-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      "Analyze Scene"
                    )}
                  </Button>
                </div>
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                  Detection Results
                </h3>
                
                {prediction && prediction.length > 0 ? (
                  <div className="space-y-3">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="font-semibold text-green-900 dark:text-green-100">
                          Objects Detected
                        </h4>
                      </div>
                      <div className="grid gap-2">
                        {prediction.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-md px-3 py-2 shadow-sm"
                          >
                            <span className="text-slate-700 dark:text-slate-300 font-medium capitalize">
                              {item.class}
                            </span>
                            {item.confidence && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
                                {Math.round(item.confidence * 100)}%
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Upload an image to see detection results
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
