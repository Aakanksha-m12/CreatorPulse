import os
import json
import tempfile
import numpy as np
import cv2
from flask import Flask, request, jsonify

app = Flask(__name__)

# Haar cascade paths (bundled with opencv-python; cv2.data removed in 5.x)
def _make_cascade(filename):
    make = getattr(cv2, "CascadeClassifier", None)
    if make is None:
        return None
    base = getattr(getattr(cv2, "data", None), "haarcascades", None)
    paths = [base + filename] if base else []
    import os as _os
    paths += [
        _os.path.join(_os.path.dirname(cv2.__file__), "data", filename),
        _os.path.join(_os.path.dirname(cv2.__file__), "etc", "haarcascades", filename),
    ]
    for cand in paths:
        try:
            c = make(cand)
            if c is not None and not c.empty():
                return c
        except Exception:
            continue
    return None

FACE_CASCADE = _make_cascade("haarcascade_frontalface_default.xml")
EYE_CASCADE = _make_cascade("haarcascade_eye.xml")

# --- Scoring weights ---
WEIGHTS = {
    "face_detection": 25,
    "brightness_contrast": 20,
    "text_overlay": 15,
    "composition": 25,
    "color_vibrancy": 15,
}


def load_image(path):
    img = cv2.imread(path)
    if img is None:
        raise ValueError(f"Cannot read image: {path}")
    return img


# ===== 1. FACE DETECTION (0-100) =====
def score_face_detection(img):
    if FACE_CASCADE is None or FACE_CASCADE.empty():
        return {
            "score": 50,
            "faces_found": 0,
            "detail": "Face detector unavailable in this OpenCV build — scored neutral.",
            "suggestion": "Thumbnails with expressive faces typically earn more clicks."
        }
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    img_area = h * w

    faces = FACE_CASCADE.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    faces = list(faces) if isinstance(faces, np.ndarray) else list(faces)

    if len(faces) == 0:
        return {
            "score": 30,
            "faces_found": 0,
            "detail": "No face detected. Thumbnails with faces get 40% more clicks on YouTube.",
            "suggestion": "Add a clear face with an expressive emotion."
        }

    largest_face = max(faces, key=lambda f: f[2] * f[3])
    fx, fy, fw, fh = largest_face
    face_area = fw * fh
    face_ratio = face_area / img_area

    face_center_x = (fx + fw / 2) / w
    face_center_y = (fy + fh / 2) / h

    eyes = EYE_CASCADE.detectMultiScale(gray[fy:fy+fh, fx:fx+fw])
    has_eyes = len(eyes) > 0

    score = 0
    # Face present: base 50
    score += 50

    # Size prominence (bigger face = better, up to 25 pts)
    if face_ratio > 0.15:
        score += 25
    elif face_ratio > 0.08:
        score += 18
    elif face_ratio > 0.03:
        score += 12
    else:
        score += 5

    # Position: rule of thirds (up to 15 pts)
    thirds_x = [1/3, 2/3]
    thirds_y = [1/3, 2/3]
    min_dist_x = min(abs(face_center_x - tx) for tx in thirds_x)
    min_dist_y = min(abs(face_center_y - ty) for ty in thirds_y)
    if min_dist_x < 0.1 and min_dist_y < 0.1:
        score += 15
    elif min_dist_x < 0.15 or min_dist_y < 0.15:
        score += 8

    # Eyes detected bonus (10 pts)
    if has_eyes:
        score += 10

    score = min(100, score)

    suggestion = "Great face placement!" if score >= 75 else "Move the face closer or center it more."
    return {
        "score": round(score),
        "faces_found": len(faces),
        "largest_face_area_pct": round(face_ratio * 100, 1),
        "eyes_detected": has_eyes,
        "detail": f"Found {len(faces)} face(s), largest covers {round(face_ratio*100,1)}% of image.",
        "suggestion": suggestion,
    }


# ===== 2. BRIGHTNESS / CONTRAST (0-100) =====
def score_brightness_contrast(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    brightness = np.mean(gray)
    contrast = np.std(gray)

    hist = cv2.calcHist([gray], [0], None, [256], [0, 256]).flatten()
    hist = hist / (h * w)

    # Histogram spread (how much of tonal range is used)
    nonzero = np.where(hist > 0.001)[0]
    if len(nonzero) > 0:
        spread = (nonzero[-1] - nonzero[0]) / 255.0
    else:
        spread = 0.0

    score = 0

    # Brightness: ideal 90-170 (25 pts)
    if 90 <= brightness <= 170:
        score += 25
    elif 60 <= brightness <= 210:
        score += 15
    else:
        score += 5

    # Contrast: ideal 50-80 (25 pts)
    if 50 <= contrast <= 80:
        score += 25
    elif 35 <= contrast <= 100:
        score += 15
    else:
        score += 5

    # Histogram spread: wider = better (25 pts)
    score += round(spread * 25)

    # Histogram balance: not too skewed (25 pts)
    lower_half = np.sum(hist[:128])
    upper_half = np.sum(hist[128:])
    balance = 1.0 - abs(lower_half - upper_half) / max(lower_half + upper_half, 1)
    score += round(balance * 25)

    score = min(100, score)

    if brightness < 70:
        suggestion = "Image is too dark. Increase brightness."
    elif brightness > 200:
        suggestion = "Image is too bright/washed out. Reduce exposure."
    elif contrast < 40:
        suggestion = "Low contrast. Increase contrast to make elements pop."
    elif score >= 75:
        suggestion = "Excellent brightness and contrast balance."
    else:
        suggestion = "Adjust brightness/contrast for better visual impact."

    return {
        "score": round(score),
        "brightness": round(float(brightness), 1),
        "contrast": round(float(contrast), 1),
        "histogram_spread_pct": round(spread * 100, 1),
        "detail": f"Brightness={round(brightness,1)}, Contrast={round(contrast,1)}, Histogram spread={round(spread*100,1)}%",
        "suggestion": suggestion,
    }


# ===== 3. TEXT OVERLAY DETECTION (0-100) =====
def score_text_overlay(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    img_area = h * w

    # Edge detection to find text-like regions
    edges = cv2.Canny(gray, 100, 200)

    # Dilate to connect nearby edges (text characters become blocks)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 5))
    dilated = cv2.dilate(edges, kernel, iterations=2)

    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    text_regions = []
    for cnt in contours:
        x, y, cw, ch = cv2.boundingRect(cnt)
        area = cw * ch
        aspect = cw / max(ch, 1)
        if area > 200 and 1.5 < aspect < 25 and ch > 8 and ch < h * 0.3:
            text_regions.append((x, y, cw, ch))

    text_area = sum(r[2] * r[3] for r in text_regions)
    text_ratio = text_area / img_area
    text_region_count = len(text_regions)

    score = 0

    # Some text present (20 pts)
    if text_region_count > 0:
        score += 20

    # Text area proportion: 5-25% is ideal for thumbnails (30 pts)
    if 0.05 <= text_ratio <= 0.25:
        score += 30
    elif 0.02 <= text_ratio <= 0.35:
        score += 18
    elif text_ratio > 0.35:
        score += 8  # too much text
    else:
        score += 10  # very little text

    # Text not covering face area (25 pts) - simplified check
    if text_region_count > 0 and text_ratio <= 0.30:
        score += 25
    else:
        score += 15

    # Text zone count: 1-3 is ideal (25 pts)
    if 1 <= text_region_count <= 3:
        score += 25
    elif text_region_count > 3:
        score += 12
    else:
        score += 8

    score = min(100, score)

    if text_ratio > 0.35:
        suggestion = "Too much text. Reduce text to 5-25% of the image."
    elif text_region_count == 0:
        suggestion = "No text detected. Consider adding a short title or hook."
    elif score >= 75:
        suggestion = "Good text placement and proportion."
    else:
        suggestion = "Adjust text size or position for better readability."

    return {
        "score": round(score),
        "text_regions_found": text_region_count,
        "text_area_pct": round(text_ratio * 100, 1),
        "detail": f"Found {text_region_count} text-like region(s) covering {round(text_ratio*100,1)}% of image.",
        "suggestion": suggestion,
    }


# ===== 4. COMPOSITION (0-100) =====
def score_composition(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape

    # Edge density in thirds regions
    edges = cv2.Canny(gray, 50, 150)

    third_h, third_w = h // 3, w // 3
    regions = {
        "top_left": edges[0:third_h, 0:third_w],
        "top_center": edges[0:third_h, third_w:2*third_w],
        "top_right": edges[0:third_h, 2*third_w:w],
        "mid_left": edges[third_h:2*third_h, 0:third_w],
        "center": edges[third_h:2*third_h, third_w:2*third_w],
        "mid_right": edges[third_h:2*third_h, 2*third_w:w],
        "bot_left": edges[2*third_h:h, 0:third_w],
        "bot_center": edges[2*third_h:h, third_w:2*third_w],
        "bot_right": edges[2*third_h:h, 2*third_w:w],
    }
    densities = {k: np.mean(v) for k, v in regions.items()}

    # Center vs edge balance
    center_density = densities["center"]
    edge_density = np.mean([densities[k] for k in densities if k != "center"])

    # Visual weight distribution
    moments = cv2.moments(gray)
    if moments["m00"] > 0:
        cog_x = moments["m10"] / moments["m00"] / w
        cog_y = moments["m01"] / moments["m00"] / h
    else:
        cog_x, cog_y = 0.5, 0.5

    # Rule of thirds: focal point near intersection
    thirds_points = [(1/3, 1/3), (2/3, 1/3), (1/3, 2/3), (2/3, 2/3)]
    min_dist = min(np.sqrt((cog_x - tx)**2 + (cog_y - ty)**2) for tx, ty in thirds_points)

    score = 0

    # Center of gravity near rule-of-thirds (30 pts)
    if min_dist < 0.12:
        score += 30
    elif min_dist < 0.2:
        score += 20
    else:
        score += 10

    # Edge distribution balance (25 pts)
    nonzero_regions = sum(1 for d in densities.values() if d > 2)
    if nonzero_regions >= 5:
        score += 25
    elif nonzero_regions >= 3:
        score += 15
    else:
        score += 8

    # Not everything in center (25 pts)
    if center_density > edge_density * 0.3:
        score += 25
    else:
        score += 15

    # Visual variety across regions (20 pts)
    density_values = list(densities.values())
    density_std = np.std(density_values)
    if 3 < density_std < 15:
        score += 20
    elif density_std > 1:
        score += 12
    else:
        score += 8

    score = min(100, score)

    if score >= 75:
        suggestion = "Strong composition with good visual balance."
    elif min_dist >= 0.2:
        suggestion = "Move the focal point toward a rule-of-thirds intersection."
    else:
        suggestion = "Distribute visual elements more evenly across the frame."

    return {
        "score": round(score),
        "focal_point": {"x_pct": round(cog_x * 100, 1), "y_pct": round(cog_y * 100, 1)},
        "rule_of_thirds_distance": round(min_dist, 3),
        "visual_regions_active": nonzero_regions,
        "detail": f"Focal point at ({round(cog_x*100,1)}%, {round(cog_y*100,1)}%), {nonzero_regions}/9 regions active.",
        "suggestion": suggestion,
    }


# ===== 5. COLOR VIBRANCY (0-100) =====
def score_color_vibrancy(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)

    saturation = hsv[:, :, 1]
    value = hsv[:, :, 2]

    mean_sat = np.mean(saturation)
    std_sat = np.std(saturation)
    mean_val = np.mean(value)

    # Hue distribution
    hue = hsv[:, :, 0]
    hist_hue = cv2.calcHist([hue], [0], None, [180], [0, 180]).flatten()
    hist_hue = hist_hue / hist_hue.sum()

    # Dominant color strength
    top_hues = np.sort(hist_hue)[-3:]
    dominance = np.sum(top_hues)

    # Unique colors (histogram uniformity)
    hist_s = cv2.calcHist([saturation], [0], None, [256], [0, 256]).flatten()
    hist_s = hist_s / hist_s.sum()
    entropy = -np.sum(hist_s[hist_s > 0] * np.log2(hist_s[hist_s > 0]))

    score = 0

    # Saturation: moderate is best (30 pts)
    if 40 <= mean_sat <= 120:
        score += 30
    elif 20 <= mean_sat <= 150:
        score += 18
    else:
        score += 8

    # Saturation variety (20 pts)
    if std_sat > 20:
        score += 20
    elif std_sat > 10:
        score += 12
    else:
        score += 5

    # Dominant color presence (25 pts)
    if dominance > 0.15:
        score += 25
    elif dominance > 0.08:
        score += 15
    else:
        score += 8

    # Color entropy (diversity) (25 pts)
    if entropy > 4.0:
        score += 25
    elif entropy > 2.5:
        score += 18
    else:
        score += 10

    score = min(100, score)

    if mean_sat < 25:
        suggestion = "Very desaturated. Add more vibrant colors to grab attention."
    elif mean_sat > 140:
        suggestion = "Oversaturated. Reduce saturation for a more natural look."
    elif score >= 75:
        suggestion = "Great color vibrancy and variety."
    else:
        suggestion = "Try using bolder, more contrasting colors."

    return {
        "score": round(score),
        "mean_saturation": round(float(mean_sat), 1),
        "color_diversity": round(float(entropy), 2),
        "dominant_color_pct": round(dominance * 100, 1),
        "detail": f"Saturation={round(mean_sat,1)}, Diversity={round(entropy,2)}, Dominant={round(dominance*100,1)}%",
        "suggestion": suggestion,
    }


# ===== OVERALL SCORE =====
def score_thumbnail(img):
    results = {
        "face_detection": score_face_detection(img),
        "brightness_contrast": score_brightness_contrast(img),
        "text_overlay": score_text_overlay(img),
        "composition": score_composition(img),
        "color_vibrancy": score_color_vibrancy(img),
    }

    weighted_total = 0
    breakdown = {}
    suggestions = []

    for key, weight in WEIGHTS.items():
        cat_score = results[key]["score"]
        weighted = round(cat_score * weight / 100, 1)
        weighted_total += weighted
        breakdown[key] = {
            "score": cat_score,
            "weight_pct": weight,
            "weighted_contribution": weighted,
            "detail": results[key].get("detail", ""),
            "suggestion": results[key].get("suggestion", ""),
        }
        if results[key].get("suggestion"):
            suggestions.append(results[key]["suggestion"])

    overall = round(weighted_total)

    if overall >= 80:
        grade = "A"
        verdict = "Excellent thumbnail - high click-through potential"
    elif overall >= 65:
        grade = "B"
        verdict = "Good thumbnail with room for improvement"
    elif overall >= 50:
        grade = "C"
        verdict = "Average thumbnail - consider the suggestions below"
    elif overall >= 35:
        grade = "D"
        verdict = "Below average - several areas need work"
    else:
        grade = "F"
        verdict = "Needs significant improvement"

    return {
        "overall_score": overall,
        "grade": grade,
        "verdict": verdict,
        "breakdown": breakdown,
        "top_suggestions": suggestions[:5],
    }


# ===== API ENDPOINTS =====
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "up", "module": "thumbnail-scorer", "opencv_version": cv2.__version__})


@app.route("/analyze", methods=["POST"])
def analyze():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded. Send image as 'file' field."}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    metadata = {}
    if "metadata" in request.files:
        try:
            metadata = json.loads(request.files["metadata"].read().decode("utf-8"))
        except Exception:
            pass

    suffix = os.path.splitext(file.filename)[1] or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        file.save(tmp.name)
        tmp_path = tmp.name

    try:
        img = load_image(tmp_path)
        h, w = img.shape[:2]
        result = score_thumbnail(img)
        result["image_info"] = {
            "filename": file.filename,
            "width": w,
            "height": h,
            "format": suffix.replace(".", "").upper(),
        }
        result["metadata"] = metadata
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


if __name__ == "__main__":
    print("Thumbnail Scorer starting on port 8001...")
    app.run(host="0.0.0.0", port=8001, debug=False)
