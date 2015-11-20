# file-system

A slim wrapper around the google chrome file API.


## Install

```sh
npm install https://github.com/peermusic/file-system
```

```js
var fs = require('file-system')(size)
```

For reference see the [Browserify Handbook](https://github.com/substack/browserify-handbook#how-node_modules-works).

## Demo

```sh
npm install -g wzrd
cd example
wzrd index.js:bundle.js
```

**Note:** If no local webserver (eg. wzrd) is used Chrome has to be started with the `--allow-file-access-from-files` flag.

## Usage

```js
// Require the module with the desired size
var fs = require('file-system')(size);

// Get a file as a data url from the filesystem based on name
fs.get(file, callback);

// Add an array of files to the filesystem
fs.add(files, callback);

// Get all files in the file system
fs.list(callback);

// Delete a single file from the file system
fs.delete(file, callback);

// Clear all files from the file system
fs.clear(callback);
```
