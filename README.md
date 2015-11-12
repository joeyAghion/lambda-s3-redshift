## Set-up:

    git clone <repo>
    cd <dir>
    nvm install 0.10.36 # version supported by AWS Lambda
    nvm use 0.10.36
    npm install
    cp config.json.example config.json # and edit to suit needs
    node test.js # optional, to simulate Lambda function (WARNING: accesses _real_ S3/Redshift resources)
    node setup.js # optional, to create staging table
    rm -f lambda-s3-redshift.zip && zip -r lambda-s3-redshift.zip ./* # package for upload to AWS

Copyright 2015 Joey Aghion, Artsy [MIT license](LICENSE.txt)
