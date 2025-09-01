//frontend/src/scene.jsx

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

export default function ImagePredictor() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
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

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Scene Prediction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            {preview && (
              <div className="mt-4 flex justify-center">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-48 h-48 object-cover rounded-lg shadow-md"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            <Button onClick={handleUpload} disabled={loading}>
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Upload & Predict"
              )}
            </Button>
          </div>

          {prediction && prediction.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-2">Detected Classes:</h2>
              <ul className="list-disc list-inside space-y-1">
                {prediction.map((item, index) => (
                  <li
                    key={index}
                    className="text-gray-700 bg-gray-100 rounded-md px-3 py-1"
                  >
                    {item.class}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
