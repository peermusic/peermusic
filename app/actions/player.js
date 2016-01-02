var engine = require('player-engine')()
var coversActions = require('./covers.js')
var shuffle = require('shuffle-array')
var musicSimilarity = require('music-similarity')

var actions = {

  // Synchronize the player engine with the loaded state
  PLAYER_SYNCHRONIZE: () => {
    return (dispatch, getState) => {
      // Bind the event listeners to the actions
      engine.on('timeupdate', duration => dispatch(actions.PLAYER_CURRENT_DURATION(duration)))
      engine.on('ended', () => dispatch(actions.PLAYBACK_NEXT()))

      // Get the current state (just after loading)
      const state = getState()

      // Set the old volume and reset playing status
      actions.PLAYER_SET_VOLUME(state.player.volume)
      dispatch(actions.PLAYER_SET_PLAYING(false))

      // Get the filename of the last played song
      const song = getSong(state.player.songId, state)
      const filename = song ? song.filename : false
      if (!filename) {
        // Old file is not here anymore :(
        dispatch(actions.PLAYER_CURRENT_DURATION(0))
      } else {
        // Old file is still here, let's load it! :)
        engine.load(filename)
        engine.seek(state.player.currentDuration)
        coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)
      }
    }
  },

  // Set the player engine to play a song
  PLAYER_SET_SONG: (id, ignoreHistory = false) => {
    return (dispatch, getState) => {
      var state = getState()

      // Don't write multiple times in the history if we are playing the same song
      if (state.player.songId === id) {
        ignoreHistory = true
      }

      // Get the song and the filename
      const song = getSong(id, state)
      const filename = song ? song.filename : false

      // Load and play the file in the engine
      engine.load(filename)
      engine.play()

      // Try and load an cover art
      coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)

      // Update the view
      dispatch({
        type: 'PLAYER_SET_SONG',
        id,
        ignoreHistory
      })
    }
  },

  // Set the playing status to true or false
  PLAYER_SET_PLAYING: (playing) => {
    (playing) ? engine.play() : engine.pause()
    return {
      type: 'PLAYER_SET_PLAYING',
      playing
    }
  },

  // Seek to a position in the player
  PLAYER_SEEK: (duration) => {
    engine.seek(duration)
    return {
      type: 'PLAYER_CURRENT_DURATION',
      duration
    }
  },

  // Set the volume ofo the player
  PLAYER_SET_VOLUME: (volume) => {
    engine.volume(volume)
    return {
      type: 'PLAYER_SET_VOLUME',
      volume
    }
  },

  // Update the current duration of the player
  PLAYER_CURRENT_DURATION: (currentDuration) => {
    return {
      type: 'PLAYER_CURRENT_DURATION',
      currentDuration
    }
  },

  // Play a song and queue the next songs to be played
  PLAYBACK_SONG: (songs, index, play = true, replace = true) => {
    return (dispatch, getState) => {
      const state = getState()

      songs = songs.map(x => x.id || x)

      if (play) {
        // Take the first song and play it
        dispatch(actions.PLAYER_SET_SONG(songs[index]))
        dispatch({type: 'SAVE_POSSIBLE_SONG_QUEUE', songs})
        // Remove the played songs
        songs = [...songs.slice(0, index), ...songs.slice(index + 1)]
      }

      if (state.player.randomPlayback) {
        // Random playback, shuffle all possible songs
        shuffle(songs)
      } else {
        // Normal playback, take the songs *after* the clicked song
        songs = [...songs.slice(index)]
      }

      // Queue the rest, but *not* for single songs
      if (songs.length > 0 && replace) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs
        })
      }

      if (songs.length > 0 && !replace) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE_PUSH',
          songs
        })
      }
    }
  },

  // Set the previous song for the player out of the history
  PLAYBACK_BACK: () => {
    return (dispatch, getState) => {
      const history = getState().player.history
      var id = history.songs[history.currentIndex - 1]
      dispatch(actions.PLAYER_SET_SONG(id, true))
      dispatch({
        type: 'HISTORY_BACK'
      })
    }
  },

  // Queue a song for playback
  PLAYBACK_USER_QUEUE: (id) => {
    return {
      type: 'PLAYBACK_USER_QUEUE_PUSH',
      id
    }
  },

  // Set the next song for the player
  PLAYBACK_NEXT: () => {
    return (dispatch, getState) => {
      const state = getState()

      // If we have a queue entry, it *always* takes priority
      const userQueue = state.player.userQueue
      if (userQueue.length > 0) {
        dispatch(actions.PLAYER_SET_SONG(userQueue[0]))
        dispatch({
          type: 'PLAYBACK_USER_QUEUE_POP'
        })
        return
      }

      // We have a history entry set, let's use that one.
      const history = state.player.history
      if (history.songs.length - 1 > history.currentIndex) {
        const id = history.songs[history.currentIndex + 1]
        dispatch(actions.PLAYER_SET_SONG(id, true))
        dispatch({
          type: 'HISTORY_NEXT'
        })
        return
      }

      const automaticQueue = state.player.automaticQueue

      // If we are on radio playback, make sure we have songs in the automatic queue
      if (state.player.radioPlayback && automaticQueue.length <= 15) {
        getRadioSongs(getSong(state.player.songId, state), state, songs => {
          actions.PLAYBACK_SONG(songs, 0, false, false)(dispatch, getState)
        })
      }

      // If we are on infinite playback, make sure that we have songs added to the automatic queue
      if (!state.player.radioPlayback && state.player.repeatPlayback && automaticQueue.length <= 15) {
        const index = !state.player.randomPlayback ? 0 : Math.floor(Math.random() * state.player.possibleQueue.length)
        actions.PLAYBACK_SONG(state.player.possibleQueue, index, false, false)(dispatch, getState)
      }

      // Take the automatically queued songs
      // (e.g. songs of a album or the radio songs)
      if (automaticQueue.length > 0) {
        dispatch(actions.PLAYER_SET_SONG(automaticQueue[0]))
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE_POP'
        })
        return
      }

      // Nothing set, let's pause on the last track
      console.log('Queue empty')
      dispatch(actions.PLAYER_SET_PLAYING(false))
      dispatch(actions.PLAYER_SEEK(0))
    }
  },

  // Toggle random playback
  TOGGLE_RANDOM_PLAYBACK: () => {
    return (dispatch, getState) => {
      const state = getState()

      if (!state.player.randomPlayback) {
        // We were *not* on shuffle before, shuffle all songs in the queue
        dispatch({type: 'SHUFFLE_AUTOMATIC_QUEUE'})
      } else {
        // Unshuffle the songs by taking the index in the original queue and then adding
        // back the songs *after* that index
        const index = state.player.possibleQueue.indexOf(state.player.songId)
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs: [...state.player.possibleQueue.slice(index + 1)]
        })
      }

      dispatch({type: 'TOGGLE_RANDOM_PLAYBACK'})
    }
  },

  // Toggle repeat playback
  TOGGLE_REPEAT_PLAYBACK: () => {
    return (dispatch, getState) => {
      const state = getState()

      // Unqueue all songs that were on repeat
      if (state.player.repeatPlayback) {
        const index = state.player.possibleQueue.indexOf(state.player.songId)
        const songs = [...state.player.possibleQueue.slice(index + 1)]
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs: state.player.randomPlayback ? shuffle(songs, {copy: true}) : songs
        })
      }

      dispatch({type: 'TOGGLE_REPEAT_PLAYBACK'})
    }
  },

  // Toggle radio playback
  TOGGLE_RADIO_PLAYBACK: () => {
    return (dispatch, getState) => {
      const state = getState()

      // Toggle the view state
      dispatch({type: 'TOGGLE_RADIO_PLAYBACK'})

      // Undo the radio playback and just take the songs we were going to play anyway
      if (state.player.radioPlayback) {
        const index = state.player.possibleQueue.indexOf(state.player.songId)
        const songs = [...state.player.possibleQueue.slice(index + 1)]
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs: state.player.randomPlayback ? shuffle(songs, {copy: true}) : songs
        })
        return
      }

      // Grab radio stuff for the current song
      const currentSong = getSong(state.player.songId, state)
      if (!currentSong) {
        return
      }
      getRadioSongs(currentSong, state, songs => {
        actions.PLAYBACK_SONG(songs, 0, false, true)(dispatch, getState)
      })
    }
  }

}

// Get the song off the state based on a song id
function getSong (songId, state) {
  return state.songs.filter(x => x.id === songId)[0]
}

// Get songs off the similarity information
function getRadioSongs (song, state, callback) {
  console.log('Getting radio songs!', song)
  // Get the metadata off the song
  var metadata = {}
  metadata.title = song.title
  metadata.album = song.album
  metadata.artist = song.artist
  metadata.genre = song.genre

  // Get similarTrack by metadata
  musicSimilarity(state.scrapingServers, metadata, function (list) {
      if (list === []) {
        callback(list)
        return
      }
      // Check if the songs are available
      list = checkAvailability(state, list)
      callback(list)
    }
  )
}

// Checks if the supplied list of songs is available in the library
function checkAvailability (state, list) {

  var results = state.songs.filter(song => {
    return list.filter(listSong =>
      listSong.artist == song.artist
      && listSong.album == song.album
      && listSong.title == song.title
    ).length > 0
  })

  return results.map(s => s.id)
}

module.exports = actions
