'use strict';

const AWS = require('aws-sdk');
const request = require('request');
const s3 = new AWS.S3();

const endpoint = process.env.endpoint; // e.g. https://yourdomain.com/api/retrieve-email/<secrethash>/<whatever>
const bucketName = process.env.s3bucket;

exports.handler = function(event, context, callback) {
    const sesNotification = event.Records[0].ses;
    const messageId = sesNotification.mail.messageId;

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
        
            //console.log("Raw email:\n" + data.Body);
            
            request.post({
                url: endpoint,
                body: {
                    content: new Buffer(data.Body).toString(),
                    mail: sesNotification.mail,
                    receipt: sesNotification.receipt
                },
                json: true
            }, function (err, response, body) {
                    if(err || response.statusCode !== 200) {
                        console.log("err", body);
                        return callback(err);
                    }
                    
                    //console.log("all good",body);
                    
                    callback(null, null);
                })
        });
        
};
