'''
Notes: 
* Use Python for the Lambda runtime and set timeout to at least 2 minutes (under Configration > General configuration)
* Set Environment variables for OPENAI_API_URL and OPENAI_API_TOKEN (under Configration > Environment variables)
* Make sure to set the Lambda function's execution role to have permissions for Rekognition and S3 (under Configration > Permissions > Execution role)
* Confirmed working when tried on lab AWS account
* This function creates a JSON file as the output containing labels and AI-generated article but can be tweaked if no output file is required
'''

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
    
    for celebrity in celebrity_response['CelebrityFaces']:
        output['celebrities'].append({
            'name': celebrity['Name'],
            'confidence': celebrity['MatchConfidence'],
            'url': celebrity.get('Urls', [])
        })

    # Generate an article using OpenAI
    article = generateArticle(output['labels'], output['celebrities'])
    output['article_title'] = article['article_title']
    output['article_subtitle'] = article['article_subtitle']
    output['article_content'] = article['article_content']
    output['article_category'] = article['article_category']


    # Write the JSON output to S3
    filename = os.path.splitext(key.split('/')[-1])[0] # Remove image file extension
    output_key = f"analysis/{filename}.json"

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

    return {
        'article_title': title,
        'article_subtitle': sub_title,
        'article_content': article_body,
        'article_category': category
    }