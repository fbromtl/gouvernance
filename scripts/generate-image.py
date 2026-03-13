import json
import base64
import urllib.request
import os
import sys

API_KEY = sys.argv[1] if len(sys.argv) > 1 else os.environ.get("GOOGLE_API_KEY", "")
if not API_KEY:
    print("Usage: python generate-image.py <GOOGLE_API_KEY>")
    sys.exit(1)

OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public", "images", "articles")
OUTPUT_PATH = os.path.join(OUTPUT_DIR, "ia-agentique-mdm.jpg")

prompt = (
    "Generate a photorealistic editorial photograph in 16:9 landscape format. "
    "Scene: A CDO and CIO reviewing fragmented data pipeline diagrams on a large "
    "wall-mounted screen showing disconnected data nodes and warning indicators. "
    "Green folders labeled MDM sit on the conference table, left unopened. "
    "Setting: modern corporate boardroom with floor-to-ceiling windows. "
    "Style: muted desaturated tones, sage green accents (#57886c) integrated naturally "
    "into the scene (folders, screen UI elements, a plant), editorial photography, "
    "natural soft window lighting, shallow depth of field, professional corporate atmosphere. "
    "No text overlays. Diverse representation. Serious, institutional tone."
)

MODEL = "gemini-3.1-flash-image-preview"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

body = json.dumps({
    "contents": [{"parts": [{"text": prompt}]}],
    "generationConfig": {
        "responseModalities": ["TEXT", "IMAGE"]
    }
}).encode("utf-8")

req = urllib.request.Request(url, data=body, headers={"Content-Type": "application/json"}, method="POST")

print(f"Generating image with {MODEL}...")
print(f"Prompt: {prompt[:120]}...")

try:
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))

    candidates = data.get("candidates", [])
    if not candidates:
        print("No candidates in response:")
        print(json.dumps(data, indent=2)[:800])
        sys.exit(1)

    parts = candidates[0].get("content", {}).get("parts", [])
    saved = False
    for part in parts:
        if "inlineData" in part:
            mime = part["inlineData"].get("mimeType", "")
            b64 = part["inlineData"]["data"]
            img_bytes = base64.b64decode(b64)
            os.makedirs(OUTPUT_DIR, exist_ok=True)

            ext = "jpg" if "jpeg" in mime else "png" if "png" in mime else "jpg"
            if ext == "png":
                OUTPUT_PATH = OUTPUT_PATH.replace(".jpg", ".png")

            with open(OUTPUT_PATH, "wb") as f:
                f.write(img_bytes)
            print(f"Image saved: {OUTPUT_PATH}")
            print(f"MIME: {mime}")
            print(f"Size: {len(img_bytes) // 1024} KB")
            saved = True
            break
        elif "text" in part:
            print(f"Text response: {part['text'][:200]}")

    if not saved:
        print("No image found in response parts")
        print(json.dumps(data, indent=2)[:800])

except urllib.error.HTTPError as e:
    error_body = e.read().decode("utf-8")
    print(f"HTTP Error {e.code}:")
    print(error_body[:800])
except Exception as e:
    print(f"Error: {e}")
