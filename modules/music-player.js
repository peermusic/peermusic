/* eslint-disable spaced-comment */
var engine = require('player-engine')
var fs = require('file-system')(64 * 1024 * 1024, ['audio/mp3', 'audio/wav', 'audio/ogg'])
var async = require('async')
var rusha = new (require('rusha'))()
var dragDrop = require('./drag-and-drop')
var similarity = require('music-similarity')

module.exports = MusicPlayer

// Manage the music player interface
function MusicPlayer (metadata, scrapingServers) {
  if (!(this instanceof MusicPlayer)) {
    return new MusicPlayer(metadata, scrapingServers)
  }

  this.metadata = metadata
  this.scrapingServers = scrapingServers
  this.engine = engine()
  this.seeking = false
  this.current_song_index = -1
}

/*******************************************************************
 * Initialization
 *******************************************************************/

// Bind the event handlers and render the initial data
MusicPlayer.prototype.initialize = function () {
  var self = this

  // Event handlers for file management
  document.querySelector('#fileUpload').onchange = function () { self.addTracks(this.files) }
  document.querySelector('#directoryUpload').onchange = function () { self.addTracks(this.files) }
  document.querySelector('#deleteFSContent').onclick = function () { self.clearTracks(this.files) }
  window.addEventListener('dragover', dragDrop.cancel)
  window.addEventListener('dragenter', dragDrop.cancel)
  window.addEventListener('dragleave', dragDrop.cancel)
  window.addEventListener('dragdrop', function (e) { dragDrop.drop(e, function (files) { self.addTracks(files) }) })
  window.addEventListener('drop', function (e) { dragDrop.drop(e, function (files) { self.addTracks(files) }) })

  // Event handlers for player
  document.querySelector('#play').onclick = function () { self.playToggle() }
  document.querySelector('#previous').onclick = function () { self.previousTrack() }
  document.querySelector('#next').onclick = function () { self.nextTrack() }
  document.querySelector('#progressBar').onmousedown = function () { self.seekingStart() }
  document.querySelector('#progressBar').oninput = function () { self.seekingUpdate() }
  document.querySelector('#progressBar').onmouseup = function () { self.seekingFinished() }
  document.querySelector('#volumeBar').oninput = function () { self.updateVolume() }

  // Click handlers for the player view
  window.playTrack = function (index) { self.playTrack(index) }
  window.removeTrack = function (filename) { self.removeTrack(filename) }
  window.queueTrack = function (index) { self.queueTrack(index) }

  this.setupEngine()
  this.loadTracks()
}

// Setup the engine events
MusicPlayer.prototype.setupEngine = function () {
  var self = this

  // Setup the volume bar
  this.engine.volume(0.2)
  document.querySelector('#volumeBar').min = 0
  document.querySelector('#volumeBar').max = 1
  document.querySelector('#volumeBar').step = 0.01
  document.querySelector('#volumeBar').value = 0.2

  // Setup the watchers for engine events
  this.engine.on('playingState', function (playing) { self.renderPlayingState(playing) })
  this.engine.on('backState', function (prev_songs) { self.renderBackState(prev_songs) })
  this.engine.on('songState', function (song) { self.renderCurrentSong(song) })
  this.engine.on('progress', function (progress) { self.renderSongProgress(progress) })
}

/*******************************************************************
 * Event & click handlers for player
 *******************************************************************/

// Toggle between play and pause
MusicPlayer.prototype.playToggle = function () {
  this.engine.toggle()
}

// Play the previous track
MusicPlayer.prototype.previousTrack = function () {
  this.engine.back()
}

// Play the next track
MusicPlayer.prototype.nextTrack = function () {
  this.engine.next()
}

// Start seeking and stop updating the progress bar
MusicPlayer.prototype.seekingStart = function () {
  this.seeking = true
}

// Update the time when seeking in the progress bar
MusicPlayer.prototype.seekingUpdate = function () {
  document.querySelector('#currentTime').innerHTML = this.formatDuration(document.querySelector('#progressBar').value)
}

// Finish seeking and skip to that position in the song
MusicPlayer.prototype.seekingFinished = function () {
  this.engine.seek(document.querySelector('#progressBar').value)
  this.seeking = false
}

// Change the playback volume
MusicPlayer.prototype.updateVolume = function () {
  this.engine.volume(document.querySelector('#volumeBar').value)
}

// Play a track by index
MusicPlayer.prototype.playTrack = function (index) {
  this.engine.setTrack(index)
}

// Remove a track by filename
MusicPlayer.prototype.removeTrack = function (filename) {
  var self = this
  this.engine.removeTrack(filename)
  fs.delete(filename, function () { self.render() })
}

// Queue a track by index
MusicPlayer.prototype.queueTrack = function (index) {
  this.engine.queueTrack(index)
  this.render()
}

/*******************************************************************
 * Rendering
 *******************************************************************/

// Render the current playing state
MusicPlayer.prototype.renderPlayingState = function (playing) {
  document.querySelector('#play').innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>'
}

// Render the current "back" button state
MusicPlayer.prototype.renderBackState = function (prev_songs) {
  document.querySelector('#previous').disabled = !prev_songs
}

// Render the current song
MusicPlayer.prototype.renderCurrentSong = function (song) {
  var metadata = this.metadata.get(song.name)
  document.querySelector('#fileContainer').innerHTML = '<strong>Currently playing:</strong> ' + metadata.album + ' - ' + metadata.artist + ' - ' + metadata.title
  document.querySelector('#currentTime').innerHTML = this.formatDuration(0)
  document.querySelector('#progressBar').min = 0
  document.querySelector('#progressBar').value = 0
  document.querySelector('#progressBar').max = song.duration
  document.querySelector('#songLength').innerHTML = this.formatDuration(song.duration)
  this.current_song_index = song.index
  this.renderCurrentCoverArt(metadata)
  this.renderSimilarTracks(metadata)
  this.render()
}

// Render the cover of the current song
MusicPlayer.prototype.renderCurrentCoverArt = function (metadata) {
  document.querySelector('#coverArt').src = ''
  this.scrapingServers.getCover(metadata, function (data) {
    document.querySelector('#coverArt').src = data
  })
}

// Render similar tracks to the current song
MusicPlayer.prototype.renderSimilarTracks = function (metadata) {
  document.querySelector('#similarTracks').innerHTML = ''
  var servers = this.scrapingServers.get().map(function (x) { return x.url })

  if (servers.length == 0) {
    return
  }

  similarity(servers, metadata, function (tracks) {
    document.querySelector('#similarTracks').innerHTML = tracks.length === 0 ? 'None found' : tracks.map(function (track) {
      return track.title
    }).join(', ')
  })
}

// Format a second value as a duration value
MusicPlayer.prototype.formatDuration = function (seconds) {
  seconds = Math.floor(seconds)
  var minutes = Math.floor(seconds / 60)
  seconds = seconds - minutes * 60
  seconds = seconds < 10 ? '0' + seconds : seconds
  return minutes + ':' + seconds
}

// Render the current song progress
MusicPlayer.prototype.renderSongProgress = function (progress) {
  if (this.seeking) {
    return
  }
  document.querySelector('#currentTime').innerHTML = this.formatDuration(progress)
  document.querySelector('#progressBar').value = Math.floor(progress)
}

// Render the track and queued tables
MusicPlayer.prototype.render = function () {
  document.querySelector('#list').innerHTML = this.renderTrackTable(this.engine.getTracks())
  document.querySelector('#queued').innerHTML = this.renderTrackTable(this.engine.getQueuedTracks(), true)
}

// Render the given views into a pretty table
MusicPlayer.prototype.renderTrackTable = function (tracks, queue) {
  if (tracks.length === 0) {
    return ''
  }

  var rows = []

  // Create headers
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
    var meta = this.metadata.get(track.name)
    var columns = []

    // Play button
    columns.push('<a href="#" onclick="playTrack(\'' + track.index + '\')"><i class="fa fa-play"></i></a>')

    // Queue button
    if (!queue) {
      columns.push('<a href="#" onclick="queueTrack(\'' + track.index + '\')"><i class="fa fa-plus"></i></a>')
    }

    // Track metadata
    columns.push(meta.title || '')
    columns.push(meta.artist || '')
    columns.push(meta.album || '')
    columns.push('<a href="#" onclick="removeTrack(\'' + track.name + '\')"><i class="fa fa-trash"></i></a>')

    if (!queue && this.current_song_index === i) {
      columns = columns.map(function (x) { return '<strong>' + x + '</strong>' })
    }

    rows.push(columns.map(function (x) { return '<td>' + x + '</td>' }).join(''))
  }

  return rows.map(function (x) { return '<tr>' + x + '</tr>' }).join('')
}

/*******************************************************************
 * File management
 *******************************************************************/

// Load the files from the filesystem and attach them to the engine
MusicPlayer.prototype.loadTracks = function () {
  var self = this
  fs.list(function (files) {
    self.engine.setFiles(files)
    self.render()
  })
}

// Add new files to the filesystem and attach them to the engine
MusicPlayer.prototype.addTracks = function (files) {
  var self = this
  console.log('Adding ' + files.length + ' tracks...')

  // Asynchronously map the files with the hash function over their contents
  async.map(files, function (file, callback) {
    var reader = new window.FileReader()
    reader.readAsDataURL(file)
    reader.onloadend = function () {
      // After reading the file hash the contents, fetch the metadata and save it
      file.hashName = rusha.digestFromString(this.result) + file.name.replace(/^.*(\.[A-Za-z0-9]{3})$/, '$1')
      self.metadata.fetch(file, function (meta) {
        meta.originalName = file.name
        self.metadata.set(file.hashName, meta)
        console.log('Track finished processing: ' + file.name)
        callback(null, file)
      })
    }
  }, function (error, results) {
    // Add the tracks into the file system
    if (error) throw error
    fs.add(results, function () { self.loadTracks() })
  })
}

// Remove all files from the file system
MusicPlayer.prototype.clearTracks = function () {
  var self = this
  fs.clear(function () { self.loadTracks() })
}
