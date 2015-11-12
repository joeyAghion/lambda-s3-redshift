// Creates stagingTable where files available for loading from S3 will be listed. E.g.:
// $ node setup.js

var pg = require('pg');
var config = require('./config.json');
var db = new pg.Client(config.connectionString);

db.connect(function(err) {
  if (err) {
    db.end();
    return console.error('Could not connect to db.', err);
  }
  db.query('CREATE TABLE ' + config.stagingTable + ' (key VARCHAR(1023), pending_at timestamp DEFAULT GETDATE(), completed_at timestamp)', function(err, result){
    if (err) {
      db.end();
      return console.error('Could not create table.', err);
    }
    console.log('Created ' + config.stagingTable + ' table.');
    db.end();
  });
});
