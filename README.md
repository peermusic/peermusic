# peermusic

[![GitHub release](https://img.shields.io/github/release/peermusic/desktop.svg?style=flat-square)](https://github.com/peermusic/desktop/releases)
[![Travis](https://img.shields.io/travis/peermusic/desktop/master.svg?style=flat-square)](https://travis-ci.org/peermusic/desktop)
[![David](https://img.shields.io/david/peermusic/desktop.svg?style=flat-square)]()
[![GitHub license](https://img.shields.io/github/license/peermusic/desktop.svg?style=flat-square)](https://github.com/peermusic/desktop/blob/master/LICENSE)

> Music player in a browsertab that works with your own mp3 files and can share music with your friends and own devices automatically. Features fully encrypted communication with all endpoints, cover art, radio, favorites, ...

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

## Styleguides

```sh
# Javascript
standard app/**/*

# SCSS
scss-lint styles/* -e styles\_normalize.scss
```
