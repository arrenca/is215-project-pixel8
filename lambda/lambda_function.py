# Note: We need to use Python for the Lambda runtime
# I confirmed this is working when I tried it on my own AWS account
# This creates a JSON file as the output but can we tweaked if no output file is required

import boto3
import json

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')

def lambda_handler(event, context):
    # Get the S3 bucket and object key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Call Rekognition to detect labels
    response = rekognition.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}},
        MaxLabels=10,
        MinConfidence=70
    )
    
    # Prepare the output JSON
    output = {
        'image': key,
        'labels': response['Labels']
    }
    
    # Write the JSON output to S3
    output_key = f"analysis/{key.split('/')[-1]}.json"
    s3.put_object(
        Bucket=bucket,
        Key=output_key,
        Body=json.dumps(output),
        ContentType='application/json'
    )
    
    return {
        'statusCode': 200,
        'body': json.dumps(f'Analysis complete for {key}')
    }
