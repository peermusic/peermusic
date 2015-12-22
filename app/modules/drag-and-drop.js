var async = require('async')

module.exports = {drop: drop, cancel: cancel, enter: enter, leave: leave}

var DROP_ZONE = '#dropzone'

// Handle drag & drop by adding the dropped files
function drop (event, callback) {
  cancel(event)
  document.querySelector(DROP_ZONE).classList.remove('show')
  document.querySelector(DROP_ZONE).classList.add('hide')

  // Get all entries from the event
  var items = event.dataTransfer.items
  var entries = []
  for (var i = 0; i < items.length; i++) {
    var entry = items[i].webkitGetAsEntry()
    if (entry) {
      entries.push(entry)
    }
  }

  // Get all files from the entries, even if they are deep in directories
  getFilesFromEntries(entries, callback)
}

// Get the files of the webkit entries
function getFilesFromEntries (entries, callback) {
  async.map(entries, function (entry, callback) {
    traverseEntryTree(entry, function (files) { callback(null, files) })
  }, function (error, results) {
    if (error) throw error

    if (results.length === 0) {
      callback([])
      return
    }

    var files = results.concat().reduce(function (x, y) { return x.concat(y) })
    callback(files)
  })
}

// Go through tree of entries and return a list of files
function traverseEntryTree (entry, callback) {
  // this entry is a file, so we are done here
  if (entry.isFile) {
    entry.file(function (file) { callback([file]) })
  }

  // this entry is a directory, we have to go deeper
  if (entry.isDirectory) {
    var dirReader = entry.createReader()
    dirReader.readEntries(function (entries) { getFilesFromEntries(entries, callback) })
  }
}

// Cancel specific drag and drop events
function cancel (event) {
  // Get the event from the window, if it is missing
  // and stop the default event handling (= showing the file)
  event = event || window.event
  if (event.preventDefault) {
    event.preventDefault()
  }

  return false
}

var dragenter_timeout = -1
var show_drop_area = false

// Show the drop area on entering
function enter (event) {
  document.querySelector(DROP_ZONE).classList.remove('hide')
  document.querySelector(DROP_ZONE).classList.add('show')
  show_drop_area = true
  return cancel(event)
}

// Hide the drop area on the last event that doesn't fire another
// dropenter event -> the event that leaves the window
function leave (event) {
  show_drop_area = false
  window.clearTimeout(dragenter_timeout)
  dragenter_timeout = window.setTimeout(function () {
    if (!show_drop_area) {
      document.querySelector(DROP_ZONE).classList.remove('show')
      document.querySelector(DROP_ZONE).classList.add('hide')
    }
  }, 100)
  return cancel(event)
}
