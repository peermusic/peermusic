var metadataReader = require('music-metadata')

module.exports = Metadata

// Persist and provide metadata for songs
function Metadata (storage) {
  if (!(this instanceof Metadata)) {
    return new Metadata(storage)
  }

  this.storage = storage
}

// Get the metadata for a song
Metadata.prototype.get = function (song) {
  return this.storage.get('metadata')[song]
}

// Set the metadata for a song
Metadata.prototype.set = function (song, metadata) {
  var tmp = this.storage.get('metadata')
  tmp[song] = metadata
  this.storage.set('metadata', tmp)
}

// Remove the metadata for a song
Metadata.prototype.remove = function (song, metadata) {
  var tmp = this.storage.get('metadata')
  delete tmp[song]
  this.storage.set('metadata', tmp)
}

// Fetch the metadata for a song of the file
Metadata.prototype.fetch = function (file, callback) {
  metadataReader(file, callback)
}
