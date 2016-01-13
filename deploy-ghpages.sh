#!/bin/bash
set -e
gulp deploy
cd public
git init
git config user.name "Travis CI"
git config user.email "travis@nobody.com"
git add .
git commit -m "Automatic deploy"
git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:master > /dev/null 2>&1