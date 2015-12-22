/* eslint-disable spaced-comment */
var engine = require('player-engine')
var fs = require('file-system')(64 * 1024 * 1024, ['audio/mp3', 'audio/wav', 'audio/ogg'])
var async = require('async')
var rusha = new (require('rusha'))()
var dragDrop = require('./drag-and-drop')

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

// File upload elements
var FILE_UPLOAD_BUTTON = '#upload-file'
var DIRECTORY_UPLOAD_BUTTON = '#upload-directory'
var DELETE_FILES_BUTTON = '#clear-files'

// Song list and queued table
var SONG_TABLE = '#list'
var QUEUED_TABLE = '#queued'

// Player elements
var CURRENT_COVER = '#current-song-cover'
var CURRENT_TITLE = '#current-song-title'
var CURRENT_ARTIST = '#current-song-artist'
var CURRENT_ALBUM = '#current-song-album'
var PLAY_BUTTON = '#player-play'
var BACK_BUTTON = '#player-backward'
var FORWARD_BUTTON = '#player-forward'
var CURRENT_TIME = '#player-current-time'
var PROGRESS_BAR = '#player-progress-bar'
var MAXIMUM_TIME = '#player-maximum-time'
var VOLUME_BAR = '#player-volume'

// Bind the event handlers and render the initial data
MusicPlayer.prototype.initialize = function () {
  var self = this

  // Event handlers for file management
  document.querySelector(FILE_UPLOAD_BUTTON).onchange = function () { self.addTracks(this.files) }
  document.querySelector(DIRECTORY_UPLOAD_BUTTON).onchange = function () { self.addTracks(this.files) }
  document.querySelector(DELETE_FILES_BUTTON).onclick = function () { self.clearTracks(this.files) }
  window.addEventListener('dragover', dragDrop.enter)
  window.addEventListener('dragenter', dragDrop.enter)
  window.addEventListener('dragleave', dragDrop.leave)
  window.addEventListener('dragdrop', function (e) { dragDrop.drop(e, function (files) { self.addTracks(files) }) })
  window.addEventListener('drop', function (e) { dragDrop.drop(e, function (files) { self.addTracks(files) }) })

  // Event handlers for player
  document.querySelector(PLAY_BUTTON).onclick = function () { self.playToggle() }
  document.querySelector(BACK_BUTTON).onclick = function () { self.previousTrack() }
  document.querySelector(FORWARD_BUTTON).onclick = function () { self.nextTrack() }
  document.querySelector(PROGRESS_BAR).onmousedown = function () { self.seekingStart() }
  document.querySelector(PROGRESS_BAR).oninput = function () { self.seekingUpdate() }
  document.querySelector(PROGRESS_BAR).onmouseup = function () { self.seekingFinished() }
  document.querySelector(VOLUME_BAR).oninput = function () { self.updateVolume() }

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
  document.querySelector(VOLUME_BAR).min = 0
  document.querySelector(VOLUME_BAR).max = 1
  document.querySelector(VOLUME_BAR).step = 0.01
  document.querySelector(VOLUME_BAR).value = 0.2

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
  document.querySelector(CURRENT_TIME).innerHTML = this.formatDuration(document.querySelector(PROGRESS_BAR).value)
}

// Finish seeking and skip to that position in the song
MusicPlayer.prototype.seekingFinished = function () {
  this.engine.seek(document.querySelector(PROGRESS_BAR).value)
  this.seeking = false
}

// Change the playback volume
MusicPlayer.prototype.updateVolume = function () {
  this.engine.volume(document.querySelector(VOLUME_BAR).value)
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
  document.querySelector(PLAY_BUTTON).innerHTML = playing ? '<i class="fa fa-pause"></i>' : '<i class="fa fa-play"></i>'
}

// Render the current "back" button state
MusicPlayer.prototype.renderBackState = function (prev_songs) {
  document.querySelector(BACK_BUTTON).disabled = !prev_songs
}

// Render the current song
MusicPlayer.prototype.renderCurrentSong = function (song) {
  var metadata = this.metadata.get(song.name)
  document.querySelector(CURRENT_TITLE).innerHTML = metadata.title
  document.querySelector(CURRENT_ARTIST).innerHTML = metadata.artist
  document.querySelector(CURRENT_ALBUM).innerHTML = metadata.album
  document.querySelector(CURRENT_TIME).innerHTML = this.formatDuration(0)
  document.querySelector(PROGRESS_BAR).min = 0
  document.querySelector(PROGRESS_BAR).value = 0
  document.querySelector(PROGRESS_BAR).max = song.duration
  document.querySelector(MAXIMUM_TIME).innerHTML = this.formatDuration(song.duration)
  this.current_song_index = song.index
  this.renderCurrentCoverArt(metadata)
  this.render()
}

// Render the cover of the current song
MusicPlayer.prototype.renderCurrentCoverArt = function (metadata) {
  document.querySelector(CURRENT_COVER).src = ''
  this.scrapingServers.getCover(metadata, function (data) {
    document.querySelector(CURRENT_COVER).src = data
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
  document.querySelector(CURRENT_TIME).innerHTML = this.formatDuration(progress)
  document.querySelector(PROGRESS_BAR).value = Math.floor(progress)
}

// Render the track and queued tables
MusicPlayer.prototype.render = function () {
  document.querySelector(SONG_TABLE).innerHTML = this.renderTrackTable(this.engine.getTracks())
  document.querySelector(QUEUED_TABLE).innerHTML = this.renderQueueTable(this.engine.getTracks())
}

// Render the given views into a pretty table
MusicPlayer.prototype.renderTrackTable = function (tracks) {
  if (tracks.length === 0) {
    return ''
  }

  var html = [
    '<tr><th></th><th>Title</th><th>Artist</th><th>Album</th><th class="creation-date">Added</th><th class="song-time">Length</th><th></th><th></th></tr>'
  ]

  for (var i = 0; i !== tracks.length; i++) {
    var track = tracks[i]
    var meta = this.metadata.get(track.name)
    var active = this.current_song_index === i
    var classes = active ? 'active' : ''
    var date = meta.creation_date ? formatDate(meta.creation_date) : '&mdash;'
    var favorite = Math.random() > 0.5 ? 'active' : '' // TODO
    var song_time = '1:23' // TODO
    var play_button = !active ? '<a href="#" onclick="playTrack(\'' + track.index + '\')"><i class="fa fa-play"></i></a>'
      : '<a href="#"><i class="fa fa-volume-up"></i></a>'
    var row = '<tr class="' + classes + '" ondblclick="playTrack(\'' + track.index + '\')">' +
      '<td class="play-button">' + play_button + '</td>' +
      '<td class="title">' + meta.title + '</td>' +
      '<td class="artist">' + meta.artist + '</td>' +
      '<td class="album">' + meta.album + '</td>' +
      '<td class="creation-date">' + date + '</td>' +
      '<td class="song-time">' + song_time + '</td>' +
      '<td class="add-button"><a href="#" onclick="queueTrack(\'' + track.index + '\')"><i class="fa fa-plus"></i></a></td>' +
      '<td class="favorite-button ' + favorite + '"><a href="#"><i class="flaticon-favorite"></i></a></td>'
    html.push(row)
  }

  return html.join('')
}

// Render the given views into a pretty queue
MusicPlayer.prototype.renderQueueTable = function (tracks) {
  if (tracks.length === 0) {
    return ''
  }

  var html = [
    '<tr><th class="number">#</th><th>Title</th><th>Artist</th><th>Album</th></tr>'
  ]

  var max = Math.min(tracks.length, 5)
  for (var i = 0; i !== max; i++) {
    var track = tracks[i]
    var meta = this.metadata.get(track.name)
    var row = '<tr ondblclick="playTrack(\'' + track.index + '\')">' +
      '<td class="number">' + (i + 1) + '</td>' +
      '<td class="title">' + meta.title + '</td>' +
      '<td class="artist">' + meta.artist + '</td>' +
      '<td class="album">' + meta.album + '</td></tr>'
    html.push(row)
  }

  return html.join('')
}

// Format a date into year-month-day
function formatDate (date) {
  date = new Date(date)
  return date.getFullYear() + '-' + date.getMonth() + '-' + date.getDate()
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
        meta.creation_date = (new Date()).toString()
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
