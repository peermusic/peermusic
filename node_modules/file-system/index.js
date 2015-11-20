/* global FileReader, FileError */
module.exports = FileSystem

function FileSystem (size) {
  if (!(this instanceof FileSystem)) {
    return new FileSystem()
  }

  window.requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem
  this.size = size
}

// Get a file as a data url from the filesystem based on name
FileSystem.prototype.get = function (file, callback) {
  requestFilesystem(this.size, function (fileSystem) {
    fileSystem.root.getFile(file, {}, function (fileEntry) {
      fileEntry.file(function (file) {
        var reader = new FileReader()

        reader.onloadend = function (e) {
          callback(this.result)
        }

        reader.readAsDataURL(file)
      }, errorHandler)
    }, errorHandler)
  })
}

// Add an array of files to the filesystem
FileSystem.prototype.add = function (files, callback) {
  requestFilesystem(this.size, function (fileSystem) {
    for (var i = 0; i !== files.length; i++) {
      addFile(fileSystem, files[i])
    }

    callback()
  })
}

// Add a single file to the file system
var addFile = function (fileSystem, file) {
  fileSystem.root.getFile(file.name, {create: true, exclusive: true}, function (entry) {
    entry.createWriter(function (writer) {
      writer.write(file)
    }, errorHandler)
  }, errorHandler)
}

// Get all files in the file system
FileSystem.prototype.list = function (callback) {
  requestFilesystem(this.size, function (fileSystem) {
    var directoryReader = fileSystem.root.createReader()
    var entries = []

    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function () {
      directoryReader.readEntries(function (results) {
        if (!results.length) {
          callback(entries.sort())
        } else {
          entries = entries.concat(toArray(results))
          readEntries()
        }
      }, errorHandler)
    }

    // Start reading dirs.
    readEntries()
  })
}

// Delete a single file from the file system
FileSystem.prototype.delete = function (file, callback) {
  requestFilesystem(this.size, function (fileSystem) {
    fileSystem.root.getFile(file, {}, function (entry) {
      entry.remove(function () {
        callback()
      }, errorHandler)
    }, errorHandler)
  })
}

// Clear all files from the file system
FileSystem.prototype.clear = function (callback) {
  this.list(function (entries) {
    entries.forEach(function (entry) {
      entry.remove(function () {
      }, errorHandler)
    })
    callback()
  })
}

// Make sure that we always get back an array
function toArray (list) {
  return Array.prototype.slice.call(list || [], 0)
}

// Request a file system from the window object
function requestFilesystem (size, callback) {
  window.requestFileSystem(window.PERMANENT, size, callback, errorHandler)
}

// Handle any file errors
function errorHandler (e) {
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      console.error('QUOTA_EXCEEDED_ERR')
      break
    case FileError.NOT_FOUND_ERR:
      console.error('NOT_FOUND_ERR')
      break
    case FileError.SECURITY_ERR:
      console.error('SECURITY_ERR')
      break
    case FileError.INVALID_MODIFICATION_ERR:
      console.error('INVALID_MODIFICATION_ERR')
      break
    case FileError.INVALID_STATE_ERR:
      console.error('INVALID_STATE_ERR')
      break
    default:
      console.error('Unknown Error')
      break
  }
}
