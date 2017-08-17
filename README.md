
# Forward Incoming SES Emails from Lambda to a WebApi Endpoint

Incoming Emails can be simply forwarded to an api endpoint via SNS (simple notificaiotn service), unfortunately
the total size of the mail is limited to 150KB in this case.

"Maximum email size (including headers) that can be published using an Amazon SNS notification
 150 KB"

 As soon a mail has an attachment, this limit is reached and a bounce is sent back to the sender.

 To keep changes small, you can just save your mails in a S3 bucket and call a very simple script (like this one) afterwards on lambda
 to forward the mail to your api endpoint. So almost everything stays the same, the only change needed is to add a new api endpoint an
 your side to retrieve the mails.

## Quick Start
 Steps to do:
 - Open your AWS console and go to the Lambda dashboard
 - Create a new function (Click Author from scratch and upload your app (see "how to build"))
 - Complete the form and remember the ARN (arn:aws:lambda:eu-west-1:YOUR_ACCOUNT_ID:function:FUNCTION_NAME)
 - Add Environment Variables and add "endpoint" (full http/https url) and set "s3bucket" to a name you can use for your raw emails (e.g. yourcompany-incoming-ses-mails (this name must be avaiable to use on s3))
 - Now it's get a bit more tricky, you need to have the aws console commands installed to add the permissions for SES to execute your function:
 Execute following command:
 ```bash
 aws lambda add-permission --function-name <ARN of the functino> --statement-id=GiveSESPermissionToInvokeFunction --principal=ses.amazonaws.com --action=lambda:InvokeFunction --source-account=<YOUR_ACCOUNT_ID> --region "eu-west-1"
 ```
Side node: try to host the lambda function and the SES in the same region. I was not able to execute a Lambda function in a different region.
 - Almost done, now switch to SES console and open the "rule sets" under the "Email Receiving" header.
 - Open the Active Rule Set (if you have already on for your domain, just edit it, otherwise create a new rule).
    - Recipients: "yourdomain.com"
    - Actions: 1. S3 Action
               Write to S3 bucket yourcompany-incoming-ses-mails
               2. Lambda Action
               Invoke Lambda function <YOUR_LAMBDA_FUNCTION> as Event

 - Test it and enjoy :)

## Endpoint Security
Make sure noone else can call your endpoint. This is up to you.

## How to build
Just download this package and run "npm install". Afterwards zip the folder (index.js should be in the root).
```bash
npm install --save <engine>
zip -r aws-ses-forward-api.zip .
```
