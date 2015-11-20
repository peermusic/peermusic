var engine = require('../index.js')
var fs = require('file-system')(64 * 1024 * 1024)

var seeking = false
var current_song_index = -1

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
  document.querySelector('#fileContainer').innerHTML = '<strong>Currently playing:</strong> ' + song.name
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

// Add files to the file system
function addFiles (files) {
  fs.add(files, attachFiles)
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
  var fragment = document.createDocumentFragment()

  for (var i = 0; i !== tracks.length; i++) {
    var track = tracks[i]
    var li = document.createElement('li')
    var playing = current_song_index === i ? '<strong>PLAYING</strong> ' : ''
    li.innerHTML = playing + '<a href="#" onclick="playTrack(\'' + track.index + '\')">' + track.name + '</a>' +
        ' &mdash; <a href="#" onclick="queueTrack(\'' + track.index + '\')">queue</a>' +
        ' &mdash; <a href="#" onclick="removeTrack(\'' + track.index + '\')">delete</a>'
    fragment.appendChild(li)
  }

  var list = document.querySelector('#list')
  list.innerHTML = ''
  list.appendChild(fragment)
}

function renderQueuedTracks () {
  var tracks = engine.getQueuedTracks()
  var fragment = document.createDocumentFragment()

  for (var i = 0; i !== tracks.length; i++) {
    var track = tracks[i]
    var li = document.createElement('li')
    li.innerHTML = '<a href="#" onclick="playTrack(\'' + track.index + '\')">' + track.name + '</a>'
    fragment.appendChild(li)
  }

  var list = document.querySelector('#queued')
  list.innerHTML = ''
  list.appendChild(fragment)
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
window.removeTrack = function (index) {
  engine.removeTrack(index)
  renderView()
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
    console.error('Folder are not supported for drag \'n\' drop yet')
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