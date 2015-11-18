# lambda-s3-redshift

This [AWS Lambda](https://aws.amazon.com/lambda/) function loads [gzipped] JSON data from S3 into a Redshift table, making use of a staging table to avoid duplication.

## Set-up:

    git clone <repo>
    cd <dir>
    nvm install 0.10.36 # version supported by AWS Lambda
    nvm use 0.10.36
    npm install
    cp config.example.json config.json # and edit to suit needs
    npm run setup # optional, to create staging table
    npm run simulate # optional, to simulate Lambda function (WARNING: accesses _real_ S3/Redshift resources)
    npm run zip # package for upload to AWS

## Configuration

The following keys in `config.json` must be customized to suit your environment:

* `awsAccessKeyId`: AWS access key with access to the S3 source location
* `awsSecretAccessKey`: AWS secret key matching the above access key
* `connectionString`: A valid connection string to your Redshift destination database (e.g., `postgres://user:pass@dbhost:5439/dbname`)
* `destinationTable`: Name of the Redshift table to load data into
* `stagingTable`: Name of a Redshift table where this function can track in-progress work (once configuration is set, you can create this table with `node setup`)

Copyright 2015 Joey Aghion, Artsy [[MIT license](LICENSE.txt)]
