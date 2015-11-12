// Main Lambda function. Inserts row for new file into stagingTable, then loads into destinationTable.

var aws = require('aws-sdk');
var pg = require('pg');
var config = require('./config.json');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = function(event, context) {
  var db = new pg.Client(config.connectionString);
  var fail = function(err, client) {
    console.error("Failure: " + err);
    client.query('ROLLBACK', function() {
      client.end();
      context.fail(err);
    });
  };
  var succeed = function(message, client) {
    console.log("Success: " + message);
    client.query('COMMIT', function(err, result) {
      if (err) return fail(err, client);
      client.end();
      context.succeed(message);
    });
  };
  var loadFromS3 = function(s3) {
    db.query('BEGIN', function(err, result) {
      if (err) return fail(err, db);
      db.query("SELECT 1 FROM " + config.stagingTable + " WHERE key = $1", [s3.object.key], function(err, result) {
        if (err) return fail(err, db);
        if (result.rows.length > 0) {
          succeed("Item with key " + s3.object.key + " already exists. Exiting.", db);
        } else {
          db.query('INSERT INTO ' + config.stagingTable + '(key) VALUES($1)', [s3.object.key], function(err, result) {
            if (err) return fail(err, db);
            var command = "COPY " + config.destinationTable +
              " FROM 's3://" + s3.bucket.name + "/" + s3.object.key + "'" +
              "CREDENTIALS 'aws_access_key_id=" + config.awsAccessKeyId + ";aws_secret_access_key=" + config.awsSecretAccessKey + "'" +
              "FORMAT AS json 'auto' GZIP timeformat 'auto'";
            db.query(command, function(err, result) {
              if (err) return fail(err, db);
              db.query("UPDATE " + config.stagingTable + " SET completed_at = GETDATE() WHERE key = $1", [s3.object.key], function(err, result) {
                if (err) return fail(err, db);
                succeed("Loaded " + s3.object.key, db);
              });
            });
          });
        }
      });
    });
  };

  db.connect(function(err) {
    if (err) context.fail(err);
    loadFromS3(event.Records[0].s3);
  });
};
