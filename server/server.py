from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
import load_image_service

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app = Flask(__name__)
CORS(app)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


@app.route("/api/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image part"}), 400

    image = request.files["image"]
    filename = secure_filename(image.filename)
    filepath = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    image.save(filepath)

    # Validate image
    if not load_image_service.is_valid_image(filepath):
        return jsonify({"error": "Invalid image"}), 400

    # Upload and get result
    result = load_image_service.load_image_to_s3(filepath)
    if result is None:
        return jsonify({"error": "Failed to upload image or retrieve analysis"}), 500

    return jsonify({
        "message": "Upload successful",
        "filename": filename,
        "image_url": result.get("image_url"),
        "analysis": result.get("analysis")
    })


@app.route("/api/ping", methods=["GET"])
def ping():
    return jsonify({"message": "pong"}), 200


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
