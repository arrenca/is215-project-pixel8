import argparse
import os
import boto3
import json
from datetime import datetime
import time

# Constants
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_IMAGE_SIZE_MB = 10
S3_BUCKET_NAME = "is215-groupb-pixel8-s3"
S3_ANALYSIS_PREFIX = "analysis/"
MAX_RETRIES = 10
DELAY_SECONDS = 6

# Initialize S3 client using IAM role (assumed role)
s3 = boto3.client("s3")


def is_valid_image(file_path):
    if not os.path.isfile(file_path):
        print(f"The file '{file_path}' does not exist.")
        return False

    file_extension = os.path.splitext(file_path)[1][1:].lower()
    if file_extension not in ALLOWED_IMAGE_EXTENSIONS:
        print(f"File type '{file_extension}' is not allowed. Allowed types: {ALLOWED_IMAGE_EXTENSIONS}")
        return False

    file_size_mb = os.path.getsize(file_path) / (1024 * 1024)
    if file_size_mb > MAX_IMAGE_SIZE_MB:
        print(f"File size {file_size_mb:.2f}MB exceeds the {MAX_IMAGE_SIZE_MB}MB limit.")
        return False

    return True


def sanitize_filename(original_filename):
    base_name, ext = os.path.splitext(original_filename)
    base_name = base_name.lower().replace(" ", "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    return f"{base_name}_{timestamp}{ext}"


def get_analysis_json(sanitized_filename):
    """Fetch the corresponding analysis JSON file from the S3 bucket."""
    json_filename = os.path.splitext(sanitized_filename)[0] + ".json"
    json_key = f"{S3_ANALYSIS_PREFIX}{json_filename}"

    try:
        response = s3.get_object(Bucket=S3_BUCKET_NAME, Key=json_key)
        json_data = json.loads(response['Body'].read().decode('utf-8'))
        return json_data
    except s3.exceptions.NoSuchKey:
        return None
    except Exception as e:
        print(f"Error retrieving JSON: {e}")
        return None


def load_image_to_s3(image_file_path):
    if not is_valid_image(image_file_path):
        return {
            "filename": os.path.basename(image_file_path),
            "message": "Upload failed",
            "error": "Invalid image format or size."
        }

    try:
        original_filename = os.path.basename(image_file_path)
        sanitized_filename = sanitize_filename(original_filename)

        s3.upload_file(image_file_path, S3_BUCKET_NAME, sanitized_filename)

        url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{sanitized_filename}"
        print(f"File uploaded successfully! Accessible at: {url}")

        # Retry logic to fetch analysis JSON
        print("Waiting for analysis JSON to become available...")
        analysis_data = None
        for attempt in range(MAX_RETRIES):
            analysis_data = get_analysis_json(sanitized_filename)
            if analysis_data:
                print(f"Analysis JSON found on attempt {attempt + 1}")
                break
            print(f"Attempt {attempt + 1}/{MAX_RETRIES}: JSON not ready. Retrying in {DELAY_SECONDS}s...")
            time.sleep(DELAY_SECONDS)

        if not analysis_data:
            print("Analysis JSON not found after waiting.")

        return {
            "filename": sanitized_filename,
            "message": "Upload successful",
            "image_url": url,
            "analysis": analysis_data if analysis_data else {"note": "Analysis JSON not found after waiting."}
        }

    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return {
            "filename": os.path.basename(image_file_path),
            "message": "Upload failed",
            "error": str(e)
        }


def main():
    parser = argparse.ArgumentParser(description="Upload an image file to S3 and fetch its analysis.")
    parser.add_argument("--image-file", required=True, help="Path to the image file to upload.")
    args = parser.parse_args()

    result = load_image_to_s3(args.image_file)
    if result:
        print("\nFinal Result:")
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
