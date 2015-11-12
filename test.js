// Simulates Lambda function. E.g.:
// $ node test.js

var lambda = require('./index');

event = {
  "Records" : [ {
    "eventVersion" : "2.0",
    "eventSource" : "aws:s3",
    "awsRegion" : "eu-west-1",
    "eventTime" : "1970-01-01T00:00:00.000Z",
    "eventName" : "ObjectCreated:Put",
    "userIdentity" : {
      "principalId" : "AIDAJDPLRKLG7UEXAMPLE"
    },
    "requestParameters" : {
      "sourceIPAddress" : "127.0.0.1"
    },
    "responseElements" : {
      "x-amz-request-id" : "C3D13FE58DE4C810",
      "x-amz-id-2" : "FMyUVURIY8/IgAtTv8xRjskZQpcIZ9KG4V5Wp6S7S/JRWeUWerMUE5JgHvANOjpD"
    },
    "s3" : {
      "s3SchemaVersion" : "1.0",
      "configurationId" : "testConfigRule",
      "bucket" : {
        "name" : "artsy-data",
        "ownerIdentity" : {
          "principalId" : "A3NL1KOZZKExample"
        },
        "arn" : "arn:aws:s3:::mybucket"
      },
      "object" : {
        "key" : "fluent_logs/gravity-production/20151001_rails-app10_15.gz",
        "size" : 1024,
        "eTag" : "d41d8cd98f00b204e9800998ecf8427e"
      }
    }
  } ]
};

function context() {}
context.done = function(err, result) {
  if (err && err !== null) {
    console.error("Error: " + JSON.stringify(err));
    process.exit(-1);
  } else {
    console.log("Result: " + JSON.stringify(result));
    process.exit(0);
  }
};
context.fail = function(err) { context.done(err); };
context.succeed = function(result) { context.done(null, result); }

lambda.handler(event, context);