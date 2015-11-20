var EventEmitter = require('events').EventEmitter
var inherits = require('inherits')

module.exports = PlayerEngine
inherits(PlayerEngine, EventEmitter)

function PlayerEngine () {
  if (!(this instanceof PlayerEngine)) {
    return new PlayerEngine()
  }

  // Save the files into an internal handling
  this.files = []

  // Internal song queue
  this.queued_songs = []

  // Song history
  this.maximum_history = 100
  this.current_track = false
  this.history_pointer = false
  this.history = []

  // Add an audio element as the actual "play" engine
  this.engine = document.createElement('audio')

  // Audio element events
  var self = this

  this.engine.addEventListener('timeupdate', function () {
    self.emit('progress', self.engine.currentTime)
  })

  this.engine.addEventListener('ended', function () {
    self.next()
  })
}

// Overwrite the internal files
PlayerEngine.prototype.setFiles = function (files) {
  this.files = files
  if (files.length === 0) {
    this.stop()
    this.current_track = false
  }
  if (files.length > 0 && this.current_track === false) {
    this.setNextTrack()
  }
}

// Set the next track to play
PlayerEngine.prototype.setNextTrack = function () {
  var file

  if (this.queued_songs.length > 0) {
    file = this.queued_songs.shift()
  } else {
    file = this.files[Math.floor(Math.random() * this.files.length)]
  }

  this.setEngineTrack(file)
  this.addHistoryTrack()
}

// Push a track to the history and manage the history
PlayerEngine.prototype.addHistoryTrack = function () {
  // Push the current track to history
  if (this.current_track) {
    // If we are in the history but force clicking a track,
    // update the history accordingly (cut at that point)
    if (this.history_pointer !== false) {
      this.history = this.history.slice(0, this.history_pointer + 1)
    }

    this.history.push(this.current_track)
    this.history_pointer = this.history_pointer === false ? 0 : this.history_pointer + 1
  }

  // Make sure we only save a maximum amount in history
  this.history = this.history.slice(Math.max(this.history.length - this.maximum_history, 0))
  this.history_pointer = this.history_pointer > this.maximum_history - 1 ? this.maximum_history - 1 : this.history_pointer

  // Tell the outside world we can now go back
  if (this.history_pointer > 0) {
    this.emit('backState', true)
  }
}

// Play a track with the engine
PlayerEngine.prototype.setEngineTrack = function (file) {
  this.current_track = file
  this.engine.src = file.toURL()

  // Publish new track to the outside world
  var self = this
  this.engine.addEventListener('loadedmetadata', function () {
    self.emit('songState', {
      name: file.name,
      duration: self.engine.duration,
      index: self.files.indexOf(file)
    })
  })
}

// Return the URL of the current track when the player is active else return "false"
PlayerEngine.prototype.playing = function () {
  return this.engine.paused === true ? false : this.engine.currentSrc
}

// Toggles the state of the player to playing/pause corresponding to the current state
PlayerEngine.prototype.toggle = function () {
  this.engine.paused === true ? this.play() : this.pause()
}

// Set the track from outside by index of the internal files
PlayerEngine.prototype.setTrack = function (index) {
  this.queued_songs = []
  this.setEngineTrack(this.files[index])
  this.addHistoryTrack()
  this.play()
}

// Queue a track to play later
PlayerEngine.prototype.queueTrack = function (index) {
  this.queued_songs.push(this.files[index])
}

// Remove a track from the queue
PlayerEngine.prototype.unqueueTrack = function (index) {
  this.queued_songs.splice(index, 1)
}

// Get all queued tracks
PlayerEngine.prototype.getQueuedTracks = function () {
  var self = this
  return this.queued_songs.map(function (x) {
    x.index = self.files.indexOf(x)
    return x
  })
}

// Remove a track from the internal file list
PlayerEngine.prototype.removeTrack = function (index) {
  this.files.splice(index, 1)
}

// Get the internal file list
PlayerEngine.prototype.getTracks = function () {
  var self = this
  return this.files.map(function (x) {
    x.index = self.files.indexOf(x)
    return x
  })
}

// Start the audio playback
PlayerEngine.prototype.play = function () {
  this.engine.play()
  this.emit('playingState', true)
}

// Stop the audio playback, an resets to the beginning of the track
PlayerEngine.prototype.stop = function () {
  this.pause()
  this.engine.currentTime = 0
}

// Pauses the audio playback, can be resumed from the current state
PlayerEngine.prototype.pause = function () {
  this.engine.pause()
  this.emit('playingState', false)
}

// Plays the last song
PlayerEngine.prototype.back = function () {
  // We are on the last time we can go back
  if (this.history_pointer <= 1) {
    this.emit('backState', false)
  }

  // Bad call
  if (this.history_pointer === 0) {
    console.error('Nothing in the history anymore')
    return
  }

  // Play the last track in history
  this.history_pointer--
  this.setEngineTrack(this.history[this.history_pointer])
  this.play()
}

// Plays the next song (either in history, queue or random)
PlayerEngine.prototype.next = function () {
  if (this.history_pointer === false || this.history_pointer === this.history.length - 1) {
    // We have no track in the history anymore, new one!
    this.setNextTrack()
  } else {
    // Grab the next track out of the history
    this.history_pointer++
    this.setEngineTrack(this.history[this.history_pointer])
    this.emit('backState', true)
  }

  this.play()
}

// Sets volume to the given volume, if volume is empty act as get function
PlayerEngine.prototype.volume = function (volume) {
  if (volume) {
    this.engine.volume = volume
  }
  return this.engine.volume
}

// Sets the playback position
PlayerEngine.prototype.seek = function (time) {
  this.engine.currentTime = time
}
