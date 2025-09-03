from fastapi import FastAPI, Query, HTTPException
from mangum import Mangum
import requests
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

API_KEY = os.getenv("GOOGLE_API_KEY")
VISION_URL = f"https://vision.googleapis.com/v1/images:annotate?key={API_KEY}"
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"


def get_city_from_coords(lat: float, lon: float) -> str | None:
    """Use Nominatim to fetch city/town/village name from coordinates."""
    try:
        params = {"lat": lat, "lon": lon, "format": "json"}
        headers = {"User-Agent": "my-fastapi-app"}  # required by Nominatim
        response = requests.get(NOMINATIM_URL, params=params, headers=headers, timeout=5)
        data = response.json()
        address = data.get("address", {})

        return (
            address.get("city")
            or address.get("town")
            or address.get("village")
            or address.get("municipality")
            or address.get("county")
        )
    except Exception:
        return None


@app.get("/detect-landmark")
async def detect_landmark(image_url: str = Query(...)):
    try:
        body = {
            "requests": [{
                "image": {"source": {"imageUri": image_url}},
                "features": [{"type": "LANDMARK_DETECTION"}]
            }]
        }

        response = requests.post(VISION_URL, json=body, timeout=10)
        result = response.json()

        # Check if landmark annotations exist
        annotations = result.get("responses", [{}])[0].get("landmarkAnnotations")
        if not annotations:
            raise HTTPException(status_code=404, detail="No landmark detected")

        landmark = annotations[0]
        lat_lng = landmark["locations"][0]["latLng"]

        # Try to get city name
        city = get_city_from_coords(lat_lng["latitude"], lat_lng["longitude"])
        if city is None:
            city = "Unknown city"

        return {
            "landmark": landmark.get("description", "Unknown"),
            "city": city,
            "location": lat_lng,
            "score": landmark.get("score", 0.0)
        }

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Request failed: {str(e)}")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

handler = Mangum(app)