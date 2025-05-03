![Pixel8 by IS215 Group B](/public/images/logo.png)
<p align="center">Automatic Generation of Articles using Amazon Rekognition and OpenAI.</p>

## Features
### Product features
- Ability to upload an image and generate an article based on tags generated via Amazon Rekognition and OpenAI.
- Generation of fictional article based on a randomly selected category `['Headline', 'News', 'Sports', 'Feature', 'Editorial', 'Business', 'Entertainment']`.
- Capability to download the generated article as a PDF file.
- Seamless uploading of new image after a news article has been generated without the need to return to home page.
- Displays an interactive loading bar while the news article generation is in progress.

### Technical Features
- Utilized both Amazon Rekognition's `detect_labels` and `recognize_celebrities` functions.
- Implemented a reverse proxy to route service endpoint calls through a central gateway enhancing security, simplifying endpoint management, enabling load balancing, and providing better control over request handling and logging.
- Equipped with automatic redirection to HTTPS enforcing secure access to the server.
- Provisioned a personal OpenAI account for the news article generation


## AWS Configuration and properties
- EC2 Instance: "IS215-GROUPB-PIXEL8"
- Elastic Ip Tag: "IS215-PROJECT-GROUPB-PIXEL8-EIP"
- EC2 IAM role set to "EMR_EC2_DefaultRole"
- Elastic Ip: 107.21.213.143
- EC2 installed packages: "python, nodejs"
- S3 Bucket: "is215-groupb-pixel8-s3"
- Lambda function: "generateArticleFromS3Image"
- Subdomain: "project.vrsevilla.is215.upou.io"


## Lambda Setup

#### 1. Create an AWS S3 bucket
  - Go to AWS Management Console and choose S3. Click `Create Bucket` button.
  - Set the Bucket name. It can be anything as long as it's unique.
  - Leave the following fields with their default values:

    |Field          |Default Value  |
    |---------------|---------------|
    | Bucket type | General purpose |
    | AWS Region | US East (N. Virginia) us-east-1 |
    | Object Ownership | ACLs disabled (recommended) |
    | Block Public Access settings for this bucket | ✅ Block _all_ public access |
    | Bucket versioning | 🔘 Disable |
    | Encryption type | 🔘 Server-side encryption with Amazon S3 managed keys (SSE-S3) |
    | Bucket key | 🔘 Enable |

  - Click `Create bucket` button at the bottom of the page.

#### 2. Set up Lambda function
  - Go to AWS Management Console and choose Lambda. Click `Create function` button.
  - Select `🔘 Author from scratch` option.
  - Set the Function name. It can also be anything but be descriptive. You can use `generateArticleFromS3Image`.
  - Set Runtime to Python 3.13.
  - Leave the architecture with its default value, x86_64.
  - Click `Change default execution role` to show the options.
  - In Execution role, select `🔘 Use an existing role`.
  - For existing role, select `LabRole`.
  - Click `Create function` button at the bottom of the page.

### 3. Connect Lambda handler to S3
  - Go to the newly created Lambda function. (Lambda > Functions > _Name_of_the_new_Lambda_function_)
  - Click `➕ Add trigger` button in Function overview.
  - Click Select a source input, search for S3, and choose S3.
  - Click Bucket input and select the S3 bucket created in step 1.
  - Click Event types input and check `✅ PUT` only.
  - Check ✅ I acknowledge that using the same S3 bucket for both input and output is not recommended and that this configuration can cause recursive invocations, increased Lambda usage, and increased costs.
  - Set Suffix to .jpg
  - Click `Add` button at the bottom of the page.
  - Repeat this step, replacing suffix with .png and other accepted filetypes. This ensures that the Lambda function runs only on supported filetypes.

### 4. Configure the newly created Lambda function
  - On the Lambda function page, click Configuration at the menu bar below Function overview.
  - In General configuration, click Edit.
  - Scroll below and set the Timeout to `2 min` `0 sec`
  - Click the `Save` button at the bottom of the page.
  - Back at the Configuration page, click Environment variables at the sidebar.
  - Click the Edit button on the right side or the one at the middle.
  - Click `Add environment variable` and input the following:
    
    |Key              | Value           |
    |-----------------|-----------------|
    |OPENAI_API_URL   | _url_provided_by_FIC_in_bonus_activity6_ |
    |OPENAI_API_TOKEN | _your_individual_key_in_bonus_activity6_ |

    _Note: Use the url and individual token provided by FIC for the activity in Additional Topics: Intelligent Systems._
    
  - Click `Save` button at the bottom of the page.

### 5. Write the Lambda handler
  - On the Lambda function page, click Code at the menu bar below Function overview.
  - You should see the default Code source written in Python. Clear the code.
  - Go to the GitHub repository and open the file [lambda_function_detection_articlegenerator.py](/lambda/lambda_function_detection_articlegenerator.py) to copy its content.
  - Go back to the Lambda function page, and paste the code.
  - Click the `Deploy` button at the left side of the code editor.

### 6. Test the Lambda function
  - Go to AWS Management Console, choose S3, and click the bucket created in Step 1 under General purpose buckets.
  - Click the `Upload` button.
  - In the Upload page, on the Files and folders section, click `Add files` and select an image.
  - Scroll down and click the `Upload` button.
  - Once upload succeeded, click the yellow `Close` button. It should redirect to the S3 bucket.
  - Wait for the output in `analysis/` folder. There should be a json object with the same name as your uploaded image.
  - If no JSON object appears, debug the Lambda function by checking its logs.
    - Go to the Lambda function page and click Monitor at the menu bar below Function overview.
    - Click `View CloudWatch logs` button.
    - Open `Log streams` at the menu bar below Log group details. It should be opened by default.
    - Click the top item on the Log streams table. It should open the logs of the most recent run of the Lambda function



## Lambda Output
The output of the Lambda function will be saved to `analysis/` folder of the same S3 bucket.
Same filename will be used. For example, uploading `playing-tennis.jpg` will result to `analysis/playing-tennis.json`.

### Example of a successful JSON output:
<details>
  <summary>concert.json</summary>

  ```
  {
    "image": "concert.jpg",
    "success": true,
    "article_title": "Musical Prodigy Sabrina Carpenter Channels Taylor Swift's Iconic Sound",
    "article_subtitle": "Rising star Sabrina Carpenter showcases her musical prowess with a guitar in hand, drawing comparisons to the legendary Taylor Swift.",
    "article_content": "In the bustling world of pop music, 23-year-old Sabrina Carpenter has emerged as a standout musician, captivating audiences with her dynamic performances and soulful voice. The multi-talented artist, often dubbed as the younger counterpart of Taylor Swift, exhibits a natural flair for the guitar, effortlessly strumming chords that echo the melodic charm reminiscent of Swift's early hits. As she navigates her way into adulthood, Carpenter's musical journey mirrors the evolution of her idol, with songs that blend catchy pop hooks with introspective lyrics that resonate with listeners of all ages.\nAmidst a sea of emerging talents, Sabrina Carpenter shines as a female force in the music industry, breaking barriers and defying expectations with each soul-stirring ballad she delivers. With her infectious stage presence and unwavering dedication to her craft, Carpenter proves that age is no hindrance when it comes to making a mark in the world of music. As she continues to enchant audiences with her heartfelt performances, the future looks exceptionally bright for this young powerhouse who embodies the essence of a true musician – fierce, authentic, and unapologetically herself, much like her musical inspiration, Taylor Swift.\n",
    "article_category": "Feature",
    "labels": [
      {
        "name": "Music",
        "confidence": 99.97051239013672
      },
      {
        "name": "Musical Instrument",
        "confidence": 99.97051239013672
      }
    ],
    "celebrities": [
      {
        "name": "Taylor Swift",
        "confidence": 99.3763656616211
      },
      {
        "name": "Sabrina Carpenter",
        "confidence": 99.0667495727539
      }
    ]
  }
  ```
</details>

### Example of an unsuccessful JSON output:
<details>
  <summary>corrupted_photo.json</summary>

  ```
  {
    "image": "corrupted_photo.jpg",
    "success": false,
    "error": "Failed to detect labels using Rekognition.",
    "detect_labels_exception": "An error occurred (InvalidImageFormatException) when calling the DetectLabels operation: Request has invalid image format",
    "detect_celebrities_exception": "An error occurred (InvalidImageFormatException) when calling the RecognizeCelebrities operation: Request has invalid image format"
  }
  ```
</details>

