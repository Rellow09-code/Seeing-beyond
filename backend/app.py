# backend/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from torchvision import models, transforms
from PIL import Image
import torch
import requests

app = Flask(__name__)
CORS(app)  


from torchvision.models import resnet50, ResNet50_Weights
weights = ResNet50_Weights.DEFAULT
model = resnet50(weights=weights)
model.eval()


transform = weights.transforms()  


LABELS_URL = "https://raw.githubusercontent.com/pytorch/hub/master/imagenet_classes.txt"
classes = requests.get(LABELS_URL).text.strip().split("\n")

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files['image']
    try:
        img = Image.open(file).convert('RGB')
        img_t = transform(img).unsqueeze(0)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    with torch.no_grad():
        outputs = model(img_t)
        _, idx = torch.max(outputs, 1)
        label = classes[idx.item()]

    return jsonify({"prediction": label})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
