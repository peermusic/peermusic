/* global MusicControls */
var engine = require('player-engine')()
var coversActions = require('./covers.js')
var shuffle = require('shuffle-array')
var musicSimilarity = require('music-similarity')
const ifvisible = require('ifvisible.js')

var isAndroid

var actions = {

  // Synchronize the player engine with the loaded state
  PLAYER_SYNCHRONIZE: () => {
    return (dispatch, getState) => {
      isAndroid = document.URL.indexOf('http://') === -1 && document.URL.indexOf('https://') === -1

      // Bind the event listeners to the actions
      engine.on('timeupdate', duration => dispatch(actions.PLAYER_CURRENT_DURATION(duration)))
      engine.on('ended', () => dispatch(actions.PLAYBACK_NEXT(true)))

      // Get the current state (just after loading)
      const state = getState()

      // Set the old volume and reset playing status
      actions.PLAYER_SET_VOLUME(state.player.volume)
      actions.PLAYER_SET_PLAYING(false, true)(dispatch, getState)

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
      }
      if (isAndroid) {
        createController(dispatch, getState)
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
      actions.PLAYER_SET_PLAYING(true)(dispatch, getState)

      // Try and load an cover art
      coversActions.GET_COVER(song.album, song.artist, song.coverId)(dispatch, getState)

      // Update media controls
      if (isAndroid) {
        createController(dispatch, getState)
      }

      // Update the view
      dispatch({
        type: 'PLAYER_SET_SONG',
        id,
        ignoreHistory
      })
    }
  },

  // Set the playing status to true or false
  PLAYER_SET_PLAYING: (playing, initialization) => {
    return (dispatch, getState) => {
      if (!initialization) {
        actions.FIX_TRACKS_FOR_ANDRIOD()(dispatch, getState)
      }
      (playing) ? engine.play() : engine.pause()
      if (isAndroid) {
        MusicControls.updateIsPlaying(playing)
      }
      dispatch({type: 'PLAYER_SET_PLAYING', playing})
    }
  },

  // Map through all songs that don't have a duration, play them with 0 volume
  // and remove them again after we grabbed the duration. This works around
  // andriod restrictions (play() is only ok if the user presses it) by hooking
  // into the user touching the screen for playback
  // Reference: https://github.com/peermusic/app/issues/6
  FIX_TRACKS_FOR_ANDRIOD: () => {
    return (dispatch, getState) => {
      const state = getState()
      const brokenSongs = state.songs.filter(s => s.duration === 0)
      if (brokenSongs.length === 0) {
        return
      }

      brokenSongs.map(song => {
        (song => {
          let triggered = false
          let audio = document.createElement('audio')
          audio.src = song.filename
          audio.volume = 0
          audio.play()
          audio.addEventListener('timeupdate', () => {
            if (triggered) { return }
            triggered = true
            audio.pause()
            dispatch({type: 'SET_SONG_DURATION', id: song.id, duration: audio.duration})
          })
        })(song)
      })
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
      var playingSong

      // Only put songs into the playback queue that we
      // hold locally, and fix up the index afterwards
      const song = songs[index]
      songs = songs.filter(x => typeof x !== 'object' || x.local)
      index = songs.indexOf(song) !== -1 ? songs.indexOf(song) : 0
      songs = songs.map(x => x.id || x)

      // We tried to play a view where we don't have local songs
      if (songs.length === 0) {
        return
      }

      if (play) {
        // Take the first song and play it
        playingSong = songs[index]
        dispatch(actions.PLAYER_SET_SONG(playingSong))
        if (songs.length > 1) {
          dispatch({type: 'SAVE_POSSIBLE_SONG_QUEUE', songs})
        }
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

      // Radio playback, grab similar songs to this and
      // completely ignore queueing songs since the radio will do that
      if (state.player.radioPlayback && play) {
        actions.GET_RADIO_SONGS(getSong(playingSong, state))(dispatch, getState)
        return
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
  PLAYBACK_NEXT: (automatic) => {
    return (dispatch, getState) => {
      const state = getState()
      const displayNotification = automatic && state.interfaceStatus.notifications && !ifvisible.now()
        ? (s) => actions.SONG_NOTIFICATION(s)(dispatch, getState)
        : () => {}

      // If we have a queue entry, it *always* takes priority
      const userQueue = state.player.userQueue
      if (userQueue.length > 0) {
        dispatch(actions.PLAYER_SET_SONG(userQueue[0]))
        displayNotification(userQueue[0])
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
        displayNotification(id)
        dispatch({
          type: 'HISTORY_NEXT'
        })
        return
      }

      const automaticQueue = state.player.automaticQueue

      // If we are on radio playback, make sure we have songs in the automatic queue
      if (state.player.radioPlayback && automaticQueue.length <= 15) {
        actions.GET_RADIO_SONGS(getSong(state.player.songId, state), true)(dispatch, getState)
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
        displayNotification(automaticQueue[0])
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE_POP'
        })
        return
      }

      // Nothing set, let's pause on the last track
      console.log('Queue empty')
      actions.PLAYER_SET_PLAYING(false)(dispatch, getState)
      dispatch(actions.PLAYER_SEEK(0))
    }
  },

  // Display a notification for the next song if
  // a) the song transition was automatic
  // b) the user has desktop notifications enabled
  // c) the user does not have the window active
  SONG_NOTIFICATION: (song) => {
    return (dispatch, getState) => {
      const state = getState()
      const songMetadata = state.songs.find(x => x.id === song)
      const currentCover = state.covers.filter(c => c.id === songMetadata.coverId)[0]
      const icon = currentCover ? currentCover.url : null

      let notification = new window.Notification(songMetadata.title, {
        icon: icon,
        body: songMetadata.artist + ' - ' + songMetadata.album
      })

      notification.onclick = () => {
        window.focus()
        notification.close()
      }

      setTimeout(() => notification.close(), 4000)
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

      actions.GET_RADIO_SONGS(currentSong)(dispatch, getState)
    }
  },

  // Get radio songs
  GET_RADIO_SONGS: (song, push = false) => {
    return (dispatch, getState) => {
      const state = getState()
      const metadata = {
        title: song.title,
        album: song.album,
        artist: song.artist,
        genre: song.genre
      }

      if (!push) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs: []
        })
      }

      require('./sync.js').REQUEST_SIMILAR(song)

      // Get a similar track by metadata
      musicSimilarity(state.scrapingServers, metadata, function (list) {
        actions.SET_RADIO_SONGS(list, metadata, push)(dispatch, getState)
      })
    }
  },

  SET_RADIO_SONGS: (list, song, push = false) => {
    return (dispatch, getState) => {
      const state = getState()

      // Only get the songs that are currently available in the local library
      list = state.songs.filter(song => {
        return list.filter(s => s.artist === song.artist &&
            s.album === song.album &&
            s.title === song.title
          ).length > 0
      })

      // Remove songs that the user listened to recently
      list = filterSimilarSongs(list, state)

      // If we got no songs, fill it with songs out of the library
      // first by matching album, then by matching artist and then randomly
      if (list.length === 0) {
        list = getSimilarLibrarySongs(song, state)
      }

      // Set the playback queue with the radio songs
      if (!push) {
        dispatch({
          type: 'PLAYBACK_AUTOMATIC_QUEUE',
          songs: list.map(s => s.id)
        })
        return
      }

      dispatch({
        type: 'PLAYBACK_AUTOMATIC_QUEUE_PUSH',
        songs: list.map(s => s.id)
      })
    }
  }

}

// Get the song off the state based on a song id
function getSong (songId, state) {
  return state.songs.filter(x => x.id === songId)[0]
}

// Remove all songs that are in the history or queue
function filterSimilarSongs (results, state) {
  // Remove the current track
  results = results.filter(r => state.player.songId !== r.id)

  // Remove tracks that we just listened to
  results = results.filter(r => state.player.history.songs.slice(0, 10).indexOf(r.id) === -1)

  // Remove tracks already in the queue
  results = results.filter(r => state.player.automaticQueue.indexOf(r.id) === -1)

  return results
}

// Get similar songs out of the library
// First by matching album, then by matching artist and then randomly
function getSimilarLibrarySongs (song, state) {
  var results = []

  // Match album
  results = results.concat(state.songs.filter(s => s.artist === song.artist && s.album === song.album))

  // Match artist
  results = results.concat(state.songs.filter(s => s.artist === song.artist))

  // Random
  for (var i = 0; i < 6; i++) {
    results.push(state.songs[Math.floor((Math.random() * state.songs.length))])
  }

  results = filterSimilarSongs(results, state)

  // Only return 3 tracks, so we try getting similar radio songs sooner
  return results.slice(0, 3)
}

function createController (dispatch, getState) {
  var state = getState()
  var song = getSong(state.player.songId, state)
  var icon

  if (song) {
    var currentCover = state.covers.filter((s) => s.id === song.coverId)[0]
    icon = currentCover ? currentCover.url : null
  }

  var isPlaying = state.player.playing ? state.player.playing : false

  MusicControls.create({
    track: song ? song.title : '',
    artist: song ? song.artist : '',
    cover: icon,
    isPlaying: isPlaying,
    hasPrev: true,
    hasNext: true,
    hasClose: false
  }, () => {}, () => {})

  // Register callback
  MusicControls.subscribe((a) => controllerEvents(a, dispatch, getState))

  // Start listening for events
  // The plugin will run the events function each time an event is fired
  MusicControls.listen()
}

function controllerEvents (action, dispatch, getState) {
  switch (action) {
    case 'music-controls-next':
      actions.PLAYBACK_NEXT()(dispatch, getState)
      break
    case 'music-controls-previous':
      actions.PLAYBACK_BACK()(dispatch, getState)
      break
    case 'music-controls-pause':
      actions.PLAYER_SET_PLAYING(false)(dispatch, getState)
      break
    case 'music-controls-play':
      actions.PLAYER_SET_PLAYING(true)(dispatch, getState)
      break
    case 'music-controls-destroy':
      break

    // Headset events (Android only)
    case 'music-controls-media-button' :
      break
    case 'music-controls-headset-unplugged':
      actions.PLAYER_SET_PLAYING(false)(dispatch, getState)
      break
    case 'music-controls-headset-plugged':
      actions.PLAYER_SET_PLAYING(true)(dispatch, getState)
      break
    default:
      break
  }
}

module.exports = actions
