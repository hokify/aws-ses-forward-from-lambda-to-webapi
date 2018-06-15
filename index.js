'use strict';

const AWS = require('aws-sdk');
const request = require('requestretry');
const s3 = new AWS.S3();

// Update the emailDomain environment variable to the correct domain, e.g. <MYDOMAIN>.com
const endpoint = process.env.endpoint;
const bucketName = process.env.s3bucket;

exports.handler = (event, context, callback) => {
    const sesNotification = event.Records[0].ses;
    const messageId = sesNotification.mail.messageId;
    // const receipt = sesNotification.receipt;

    console.log('Processing message:', messageId);

// Retrieve the email from your bucket
    s3.getObject({
        Bucket: bucketName,
        Key: sesNotification.mail.messageId
    }, function(err, data) {
        if (err) {
            console.log(err);
            return callback(err);
        }

        console.log("Raw email length:\n" + (data.Body && data.Body.length) || 'no body');

        request.post({
            url: endpoint,
            body: {
                content: Buffer.from(data.Body).toString(),
                mail: sesNotification.mail,
                receipt: sesNotification.receipt
            },
            json: true
        }, function (err, response, body) {
            if(err || response.statusCode != 200) {
                console.log("err", body)
                return callback(err);
            }

            console.log("all good",body);

            callback(null, null);
        })
    });

};
