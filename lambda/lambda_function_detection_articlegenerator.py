import boto3
import json
import urllib.request
import os
import random

s3 = boto3.client('s3')
rekognition = boto3.client('rekognition')

def lambda_handler(event, context):
    # Get the S3 bucket and object key from the event
    bucket = event['Records'][0]['s3']['bucket']['name']
    key = event['Records'][0]['s3']['object']['key']

    # Prepare the output JSON and Image object
    output = {'image': key}
    image = {'S3Object': {'Bucket': bucket, 'Name': key}}

    # Call Rekognition to detect labels
    output_labels = detect_labels(image)

    # Call Rekognition to recognize celebrities
    output_celebrities = recognize_celebrities(image)

    # Generate an article using OpenAI
    output_article = generate_article(
        output_labels.get('labels', []),
        output_celebrities.get('celebrities', [])
    )

    # Update the output JSON with the results
    # Add success flag to indicate status
    output['success'] = 'error' not in output_labels and 'error' not in output_article
    output.update(output_article)
    output.update(output_labels)
    output.update(output_celebrities)

    # Write the JSON output to S3
    try:
        filename = os.path.splitext(key.split('/')[-1])[0] # Remove image file extension
        output_key = f"analysis/{filename}.json"
        s3.put_object(
            Bucket=bucket,
            Key=output_key,
            Body=json.dumps(output),
            ContentType='application/json'
        )
    except Exception as e:
        # Log error to CloudWatch
        print(f'Returned statusCode 500. Failed to write output to S3: {str(e)}')
        return {
            'statusCode': 500,
            'body': json.dumps(f'Failed to write output to S3: {str(e)}')
        }

    return {
        'statusCode': 200,
        'body': json.dumps(f'Analysis complete for {key}')
    }

def detect_labels(image):
    try:
        label_response = rekognition.detect_labels(
            Image=image,
            MaxLabels=10,
            MinConfidence=70
        )

        # Remove other fields in label_response to minimize output file size
        simplified_label_response = []
        for label in label_response.get('Labels', []):
            simplified_label_response.append({
                'name': label['Name'],
                'confidence': label['Confidence']
            })

        return {'labels': simplified_label_response}
    except Exception as e:
        return {
            'error': 'Failed to detect labels using Rekognition.',
            'detect_labels_exception': str(e)
        }

def recognize_celebrities(image):
    try:
        celebrities_response = rekognition.recognize_celebrities(Image=image)
        celebrities = []

        # Remove other fields in celebrities_response to minimize output file size
        for celebrity in celebrities_response.get('CelebrityFaces', []):
            celebrities.append({
                'name': celebrity['Name'],
                'confidence': celebrity['MatchConfidence']
            })
        return {'celebrities': celebrities}
    except Exception as e:
        # Do not add error when detecting celebrities fail
        return {'detect_celebrities_exception': str(e)}

def generate_article(labels, celebrities):
    # Do not generate an article if labels is empty
    if not labels:
        return {}

    url = os.environ['OPENAI_API_URL']
    token = os.environ['OPENAI_API_TOKEN']

    # Append all labels and celebrities in a single list
    label_list = []
    for celebrity in celebrities:
        label_list.append(celebrity['name'])

    for label in labels:
        label_list.append(label['name'])

    keywords = ", ".join(label_list)

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }

    # Category
    categories = ['Headline', 'News', 'Sports', 'Feature', 'Editorial', 'Business', 'Entertainment']
    category = random.choice(categories) # Randomly select a category for the prompt

    # Prompt for Open AI
    prompt = (
        f"Imagine you're writing for the {category} section of a major newspaper. "
        f"Based on these keywords: {keywords}, generate a fictional but realistic newspaper article. "
        f"Your response must include:\n"
        f"1. A clear, attention-grabbing title.\n"
        f"2. A one-sentence sub-title.\n"
        f"3. The full article body (2 paragraphs).\n\n"
        f"Format your response like this:\n"
        f"Title: <your title>\n"
        f"Sub-title: <your sub-title>\n"
        f"Content:\n<your 2-paragraph article>"
    )

    data = {
        'model': 'gpt-3.5-turbo',
        'messages': [
            {
                'role': 'system',
                'content': 'You are a creative and precise news writer.'
            },
            {
                'role': 'user',
                'content': prompt
            }
        ]
    }
    json_data = json.dumps(data).encode('utf-8')

    try:
        req = urllib.request.Request(url, data=json_data, headers=headers, method='POST')
        with urllib.request.urlopen(req) as response:
            response_string = response.read().decode('utf-8')
            response_dict = json.loads(response_string)

            # Extract content from OpenAI response
            content = response_dict['choices'][0]['message']['content']

        lines = content.strip().split('\n')
        title = ""
        sub_title = ""
        article_body = ""
        parse_content = False

        for line in lines:
            line = line.strip()
            if line.startswith("Title:"):
                title = line.replace("Title:", "").strip()
            elif line.startswith("Sub-title:"):
                sub_title = line.replace("Sub-title:", "").strip()
            elif line.startswith("Content:"):
                parse_content = True
            elif parse_content and line:
                article_body += line + "\n"

        if not title and not sub_title and not article_body:
            return {'error': 'Failed to parse response from OpenAI.'}

        return {
            'article_title': title,
            'article_subtitle': sub_title,
            'article_content': article_body,
            'article_category': category
        }
    except Exception as e:
        return {
            'error': 'Failed to generate article using OpenAI.',
            'generate_article_exception': str(e)
        }
