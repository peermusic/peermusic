# peermusic - [user stories](https://github.com/peermusic/user-stories/issues)

[![GitHub release](https://img.shields.io/badge/release-v0.1.0-blue.svg?style=flat-square)](https://github.com/peermusic/app/releases)
[![Travis](https://img.shields.io/travis/peermusic/app/master.svg?style=flat-square)](https://travis-ci.org/peermusic/app)
[![David](https://img.shields.io/david/peermusic/app.svg?style=flat-square)]()
[![GitHub license](https://img.shields.io/badge/licence-AGPL_v3.0-blue.svg?style=flat-square)](https://github.com/peermusic/app/blob/master/LICENSE)

> *Music player in a browsertab that works with your own mp3 files and can share music with your friends and own devices automatically. Features fully encrypted communication with all endpoints, cover art, radio, favorites, ...*

[![peermusic interface](http://i.imgur.com/zkNgtMO.png)](http://peermusic.github.io/)

## Run online

[You can use the player directly via Github Pages.](http://peermusic.github.io/)

## Install & run locally

```sh
npm install -g gulp
npm install
gulp
```

After that, the server is now running on `localhost:8000` and the files get recompiled into `public/build/` on change. 
If you have http://livereload.com/extensions/ installed, they even get instantly reloaded in the browser.

## Connect with friends

To connect with friends the application will ask you for a "hub url". 
The easiest way is to run a [signalhub server](https://github.com/mafintosh/signalhub) locally using the following commands.

```
npm install -g signalhub
signalhub listen -h localhost -p 7000
```

## Styleguides

```sh
# Javascript
standard app/**/*

# SCSS
scss-lint styles/* -e styles\_normalize.scss
```
