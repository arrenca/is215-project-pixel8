# Note: We need to use Python for the Lambda runtime
# I confirmed this is working when I tried it on my own AWS account
# This creates a JSON file as the output but can be tweaked if no output file is required

import boto3
import json
import urllib.request
import os

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')

def lambda_handler(event, context):
    # Get the S3 bucket and object key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']
    
    # Call Rekognition to detect labels
    label_response = rekognition.detect_labels(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}},
        MaxLabels=10,
        MinConfidence=70
    )
    
    # Call Rekognition to recognize celebrities
    celebrity_response = rekognition.recognize_celebrities(
        Image={'S3Object': {'Bucket': bucket, 'Name': key}}
    )
    
    # Prepare the output JSON
    output = {
        'image': key,
        'labels': label_response['Labels'],
        'celebrities': []
    }
    
    # Process recognized celebrities
    for celebrity in celebrity_response['CelebrityFaces']:
        output['celebrities'].append({
            'name': celebrity['Name'],
            'confidence': celebrity['MatchConfidence'],
            'url': celebrity.get('Urls', [])
        })

    # Generate an article using OpenAI
    article = generateArticle(output['labels'], output['celebrities'])
    output['article_title'] = article['article_title']
    output['article_content'] = article['article_content']
    
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

def generateArticle(labels, celebrities):
    url = os.environ['OPENAI_API_URL']
    token = os.environ['OPENAI_API_TOKEN']

    # Append all labels and celebrities in a single list
    label_list = []
    for celebrity in celebrities:
        label_list.append(celebrity['name'])

    for label in labels:
        label_list.append(label['Name'])

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    label_names = ", ".join(label_list)
    prompt = (
        f'Generate a two-paragraph news article based on the following content: {label_names}. '
        f'Include a one-line title at the start followed by a new line. '
        f'Be as creative as possible but make the story coherent. Be whimsical—have fun with it. If it's a known personality, make sure to include their actual name in the storyline.'
    )
    data = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'system',
                'content': 'You are a helpful assistant.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ]
    }
    json_data = json.dumps(data).encode('utf-8')

    req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
    with urllib.request.urlopen(req) as response:
        response_string = response.read().decode('utf-8')
        response_dict = json.loads(response_string)

        # Extract content from OpenAI response
        response_content = response_dict['choices'][0]['message']['content']
        title, content = response_content.split('\n', 1)

    return {
        'article_title': title.strip(),
        'article_content': content.strip()
    }
