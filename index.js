// Main Lambda function. Inserts row for new file into stagingTable, then loads file contents into destinationTable.

var aws = require('aws-sdk');
var pg = require('pg');
var async = require('async');
var config = require('./config.json');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });

exports.handler = function(event, context) {
  var db = new pg.Client(config.connectionString);
  var s3 = event.Records[0].s3;
  var tries = 0;
  var rollback = function(err, callback) {
    console.error("Rolling back...", err);
    db.query('ROLLBACK', function() {
      callback(err);
    });
  };
  var commit = function(message, callback) {
    db.query('COMMIT', function(err, result) {
      if (err) return rollback(err, callback);
      console.log("Committing...", message);
      callback(null, message);
    });
  };
  var loadFromS3 = function(callback) {
    console.log("Started loading " + s3.object.key + " (try " + ++tries + ")");
    db.query('BEGIN; LOCK ' + config.stagingTable, function(err, result) {
      if (err) return callback(err);
      var select = "SELECT";
      db.query("SELECT 1 FROM " + config.stagingTable + " WHERE key = $1", [s3.object.key], function(err, result) {
        if (err) return rollback(err, callback);
        if (result.rows.length > 0) {
          return commit("Item with key " + s3.object.key + " already exists.", callback);
        } else {
          db.query('INSERT INTO ' + config.stagingTable + '(key) VALUES($1)', [s3.object.key], function(err, result) {
            if (err) return rollback(err, callback);
            var command = "COPY " + config.destinationTable +
              " FROM 's3://" + s3.bucket.name + "/" + s3.object.key + "'" +
              "CREDENTIALS 'aws_access_key_id=" + config.awsAccessKeyId + ";aws_secret_access_key=" + config.awsSecretAccessKey + "'" +
              "FORMAT AS json 'auto' GZIP timeformat 'auto'";
            db.query(command, function(err, result) {
              if (err) return rollback(err, callback);
              db.query("UPDATE " + config.stagingTable + " SET completed_at = GETDATE() WHERE key = $1", [s3.object.key], function(err, result) {
                if (err) return rollback(err, callback);
                commit("Loaded " + s3.object.key, callback);
              });
            });
          });
        }
      });
    });
  };

  db.connect(function(err) {
    if (err) return context.done(err);
    async.retry({times: config.retries, interval: config.retryInterval}, loadFromS3, function(err, result) {
      console.log("Completed", {tries: tries, err: err, result: result});
      db.end();
      context.done(err, result);
    });
  });
};
