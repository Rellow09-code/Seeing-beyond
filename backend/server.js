// backend/server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const multer = require("multer");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });


app.post("/predict-scene", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;
    const image = fs.readFileSync(imagePath, { encoding: "base64" });

    const response = await axios({
      method: "POST",
      url: "https://serverless.roboflow.com/construction-site-safety/27",
      params: { api_key: "SDvW81XMHkIPZNwp3wg9" },
      data: image,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    fs.unlinkSync(imagePath); // delete file
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Prediction failed" });
  }
});



app.get('/', (req, res) => {
  res.send('Backend is running');
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
