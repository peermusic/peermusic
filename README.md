# Peermusic

[![Travis](https://img.shields.io/travis/peermusic/peermusic/master.svg?style=flat-square)](https://travis-ci.org/peermusic/peermusic)
[![David](https://img.shields.io/david/peermusic/peermusic.svg?style=flat-square)](https://david-dm.org/peermusic/peermusic)
[![GitHub license](https://img.shields.io/badge/license-AGPL_v3.0-blue.svg?style=flat-square)](https://github.com/peermusic/app/blob/master/LICENSE)

> Peermusic is a mobile ready music player that runs locally the browser. It strives to deliver all convenience features of modern music players combined with easy and encrypted peer-to-peer based sharing of music files.

[![Peermusic interface on desktop and mobile phone](http://i.imgur.com/Z68ynbf.png)](http://peermusic.github.io/)


## Features

<a href=https://github.com/pguth/Ethical-Design-Manifesto><img src=https://ind.ie/ethical-design/images/ethical-design-badge-small.svg align=right alt="We strive to practice Ethical Design." /></a>

- [x] Runs in your browser tab.
- [x] Features a beautiful mobile ready interface with different themes for every taste.
- [x] Connections are only established between Peermusic instances that got deliberately connected by the user(s).
- [x] The music player is a single-page application that can run offline.
- [x] Requires minimal server infrastructure:
  - (required) A [signalhub server](https://github.com/mafintosh/signalhub) via which instances can initiate their peer-to-peer connections.
  - (optional) A [metadata providing server](https://github.com/peermusic/node-scraping-server) that delivers cover art and information about similarity of songs.
- [x] A radio functionality that tries to automatically generate meaningful playlists.
- [x] Connects peer-to-peer between instances to share data.
- [x] Secures the communication cryptographically (regular WebRTC encryption - no public key pinning).
- [x] Does not leak IP information to the central signalhub server that faciliates the peer-to-peer connection setup.
- [x] Peermusic instances can be set to one of four different sharing levels:
  - "leech" and "private" only connect to the users own Peermusic instances.
  - "friends" allows connections to instances that were added as friends by the user.
  - [x] "everyone" takes advantage of [WebTorrent](https://github.com/feross/webtorrent):
    - Locally available songs will be seeded via WebTorrent.
    - Locally unavailable songs that are requested by other instances will be downloaded via WebTorrent.
- [x] Peermusic instances employ an escrow sharing concept:
  - If A knows B and B knows C. But A does not know C. Then B will act as an escrow between A and C.
  - This escrow concept is used for:
    - [x] The index of available songs.
    - [x] The songs themselves.
    - [ ] The songs metadata (cover art and similarity information).
- [x] Association of instances using QR codes and custom `web+peermusic://...` URLs.
- [x] Desktop notifications on track changes.
- [x] Works with Google Chrome and Chromium on desktop and mobile plattforms.
- [x] *Peermusic can easily be self hosted.*


## Install

*You can find the most recent version here: [Peermusic hosted on Github Pages](http://peermusic.github.io/).*

```sh
git clone https://github.com/peermusic/peermusic.git
cd peermusic
npm install -g gulp
npm install
gulp
```

A local webserver will be started on [http://localhost:8000](http://localhost:8000). A file watcher will automatically recompiled when source files are beeing changed. The generated files will be placed in `public/build/`.

Also a local signalhub server will be started on [http://localhost:7000](http://localhost:7000) to allow for easy testing of the peer-to-peer features. To run a different instance of Peermusic within the same browser use [http://127.0.0.1:8000](http://127.0.0.1:7000).

If you have [livereload](http://livereload.com/extensions/) installed browser reloads will be triggered automatically on code changes.


## Related

- [Our little knowledgebase](https://github.com/peermusic/research)
