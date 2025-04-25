# IS215 Project PIXEL8
Automatic Generation of Articles using Amazon Rekognition and OpenAI.

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
  
