import argparse
import os
import boto3
from datetime import datetime

# Constants
ALLOWED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg"}
MAX_IMAGE_SIZE_MB = 10
S3_BUCKET_NAME = "is215-groupb-pixel8-s3"

# Initialize S3 client using IAM role (no credentials required)
s3 = boto3.client("s3")


def is_valid_image(file_path):
    """Validate image file extension and size."""
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
    """Sanitize the filename: lowercase, underscores, and timestamp suffix."""
    base_name, ext = os.path.splitext(original_filename)
    base_name = base_name.lower().replace(" ", "_")
    # timestamp = datetime.now().strftime("%H%M%S")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    sanitized_name = f"{base_name}_{timestamp}{ext}"
    return sanitized_name


def load_image_to_s3(image_file_path):
    """Upload an image file to the S3 bucket and return the URL."""
    if not is_valid_image(image_file_path):
        return None

    try:
        original_filename = os.path.basename(image_file_path)
        sanitized_filename = sanitize_filename(original_filename)

        s3.upload_file(image_file_path, S3_BUCKET_NAME, sanitized_filename)

        # Generate public S3 URL
        url = f"https://{S3_BUCKET_NAME}.s3.amazonaws.com/{sanitized_filename}"
        print(f"File uploaded successfully! Accessible at: {url}")
        return url

    except Exception as e:
        print(f"Error uploading file to S3: {e}")
        return None


def main():
    parser = argparse.ArgumentParser(description="Upload an image file to S3.")
    parser.add_argument("--image-file", required=True, help="Path to the image file to upload.")
    args = parser.parse_args()

    load_image_to_s3(args.image_file)


if __name__ == "__main__":
    main()
