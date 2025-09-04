# Work Safety Classification API

This is a Node.js-based REST API that uses Roboflow to classify construction site safety from images provided via a URL.  

---

## Endpoint

### `POST /predict-scene`

Classifies an image from a provided URL.

- **Method:** `POST`
- **URL:** `/predict-scene`
- **Headers:** `Content-Type: application/json`
- **Body Parameters:**

| Parameter    | Type   | Description                |
|--------------|--------|----------------------------|
| `image_url`  | string | Public URL of the image    |

---

### Example Request

```json
{
  "image_url": "https://example.com/construction-site.jpg"
}

### Render-deployed
https://work-saftey-classification.onrender.com 
make a post to this.