var engine = require('player-engine')
var fs = require('file-system')(64 * 1024 * 1024, ['audio/mp3', 'audio/wav', 'audio/ogg'])
var async = require('async')
var rusha = new (require('rusha'))()
var musicMetadata = require('music-metadata')

var seeking = false
var current_song_index = -1

// In-memory storage with persistence through localStorage
var meta_storage = {
  cache: JSON.parse(window.localStorage.getItem('metadata')) || {},
  get: function (key) {
    return this.cache[key]
  },
  set: function (key, meta) {
    this.cache[key] = meta
    window.localStorage.setItem('metadata', JSON.stringify(this.cache))
  }
}

// Initialize the player engine & event listeners
engine = engine()

// Setup the volume bar
engine.volume(0.2)
document.querySelector('#volumeBar').min = 0
document.querySelector('#volumeBar').max = 1
document.querySelector('#volumeBar').step = 0.01
document.querySelector('#volumeBar').value = 0.2

// Toggle the playing state
engine.on('playingState', function (playing) {
  document.querySelector('#play').innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>'
})

// Toggle the "back" state
engine.on('backState', function (back_possible) {
  document.querySelector('#previous').disabled = !back_possible
})

// Update songs
engine.on('songState', function (song) {
  var meta = meta_storage.get(song.name)
  document.querySelector('#fileContainer').innerHTML = '<strong>Currently playing:</strong> ' + meta.album + ' - ' + meta.artist + ' - ' + meta.title
  document.querySelector('#currentTime').innerHTML = duration(0)
  document.querySelector('#progressBar').min = 0
  document.querySelector('#progressBar').value = 0
  document.querySelector('#progressBar').max = song.duration
  document.querySelector('#songLength').innerHTML = duration(song.duration)
  current_song_index = song.index
  renderView()
})

// Update progress
engine.on('progress', function (progress) {
  if (!seeking) {
    document.querySelector('#currentTime').innerHTML = duration(progress)
    document.querySelector('#progressBar').value = Math.floor(progress)
  }
})

function hash (string) {
  return rusha.digestFromString(string)
}

// Add files to the file system
function addFiles (files) {
  // Asynchronously map the files with the hash function over their contents
  async.map(files, function (file, callback) {
    var reader = new window.FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function () {
      file.hashName = hash(this.result) + file.name.replace(/^.*(\.[A-Za-z0-9]{3})$/, '$1')
      musicMetadata(file, function (meta) {
        meta.originalName = file.name
        meta_storage.set(file.hashName, meta)
        callback(null, file)
      })
    }
  }, function (error, results) {
    // Add the files into the file system, which uses "hashName" as a priority
    if (error) throw error
    fs.add(results, attachFiles)
  })
}

// Update the engine's files with the one's from the file system
function attachFiles () {
  fs.list(function (files) {
    engine.setFiles(files)
    renderView()
  })
}

// Read the files from the engine and write them into the view
function renderView () {
  renderTracks()
  renderQueuedTracks()
}

function renderTracks () {
  var tracks = engine.getTracks()
  document.querySelector('#list').innerHTML = trackTableHtml(tracks)
}

function renderQueuedTracks () {
  var tracks = engine.getQueuedTracks()
  document.querySelector('#queued').innerHTML = trackTableHtml(tracks, true)
}

function trackTableHtml (tracks, queue) {
  if (tracks.length === 0) {
    return ''
  }

  var rows = []

  var headers = []
  headers.push('')

  if (!queue) {
    headers.push('')
  }

  headers.push('Title')
  headers.push('Artist')
  headers.push('Album')
  headers.push('')
  rows.push(headers.map(function (x) { return '<th>' + x + '</th>' }).join(''))

  for (var i = 0; i !== tracks.length; i++) {
    var track = tracks[i]
    var meta = meta_storage.get(track.name)
    var columns = []

    columns.push('<a href="#" onclick="playTrack(\'' + track.index + '\')"><i class="fa fa-play"></i></a>')

    if (!queue) {
      columns.push('<a href="#" onclick="queueTrack(\'' + track.index + '\')"><i class="fa fa-plus"></i></a>')
    }

    columns.push(meta.title || '')
    columns.push(meta.artist || '')
    columns.push(meta.album || '')
    columns.push('<a href="#" onclick="removeTrack(\'' + track.name + '\')"><i class="fa fa-trash"></i></a>')

    if (!queue && current_song_index === i) {
      columns = columns.map(function (x) { return '<strong>' + x + '</strong>' })
    }

    rows.push(columns.map(function (x) { return '<td>' + x + '</td>' }).join(''))
  }

  return rows.map(function (x) { return '<tr>' + x + '</tr>' }).join('')
}

// Format a second value as minutes:seconds
function duration (seconds) {
  seconds = Math.floor(seconds)
  var minutes = Math.floor(seconds / 60)
  seconds = seconds - minutes * 60
  seconds = seconds < 10 ? '0' + seconds : seconds
  return minutes + ':' + seconds
}

// Bind the window events
window.addEventListener('load', function () {
  attachFiles()

  // Add files
  document.querySelector('#myfile').onchange = function () {
    addFiles(this.files)
  }

  // Clear files
  document.querySelector('#deleteFSContent').onclick = function () {
    fs.clear(attachFiles)
  }

  // Play/pause toggle
  document.querySelector('#play').onclick = function () {
    engine.toggle()
  }

  // "Back" button
  document.querySelector('#previous').onclick = function () {
    engine.back()
  }

  // "Skip" button
  document.querySelector('#next').onclick = function () {
    engine.next()
  }

  // Progress bar sliding updates the time
  document.querySelector('#progressBar').oninput = function () {
    document.querySelector('#currentTime').innerHTML = duration(document.querySelector('#progressBar').value)
  }

  // Stop updating the progress bar while seeking
  document.querySelector('#progressBar').onmousedown = function () {
    seeking = true
  }

  // Done with seeking, skip to that position in the song
  document.querySelector('#progressBar').onmouseup = function () {
    engine.seek(document.querySelector('#progressBar').value)
    seeking = false
  }

  // Change the volume
  document.querySelector('#volumeBar').oninput = function () {
    engine.volume(document.querySelector('#volumeBar').value)
  }
})

// Bind interface events
window.playTrack = function (index) {
  engine.setTrack(index)
}

// Delete a track
window.removeTrack = function (filename) {
  engine.removeTrack(filename)
  fs.delete(filename, renderView)
}

// Queue a track
window.queueTrack = function (index) {
  engine.queueTrack(index)
  renderView()
}

// Handle drag & drop by adding the dropped files
function windowDrop (event) {
  // get window.event if e argument missing (in IE)
  event = event || window.event

  // stops the browser from redirecting off to the image.
  if (event.preventDefault) {
    event.preventDefault()
  }

  var files = event.dataTransfer.files

  // Check if the item is a folder
  if (files[0].type === '') {
    console.error("Folder are not supported for drag 'n' drop yet")
    return
  }

  addFiles(files)
}

// Cancel this event
function cancel (e) {
  if (e.preventDefault) {
    e.preventDefault()
  }

  return false
}

// Event listeners -------------------------------------------------------------

window.addEventListener('dragover', cancel)
window.addEventListener('dragenter', cancel)
window.addEventListener('dragleave', cancel)
window.addEventListener('dragdrop', windowDrop)
window.addEventListener('drop', windowDrop)
