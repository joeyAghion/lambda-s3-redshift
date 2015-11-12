## Set-up:

    git clone <repo>
    cd <dir>
    nvm install 0.10.36 # version supported by AWS Lambda
    nvm use 0.10.36
    npm install
    cp config.json.example config.json # and edit to suit needs
    npm run simulate # optional, to simulate Lambda function (WARNING: accesses _real_ S3/Redshift resources)
    npm run setup # optional, to create staging table
    npm run zip # package for upload to AWS

Copyright 2015 Joey Aghion, Artsy [MIT license](LICENSE.txt)
